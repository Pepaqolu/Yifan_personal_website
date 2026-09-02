import "server-only";

import { resolve4, resolve6 } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";

const MAX_BYTES = 1_500_000;
const MAX_TEXT = 14_000;
const MAX_REDIRECTS = 2;
const TIMEOUT_MS = 8_000;

export type RetrievedPage = { url: string; title: string; text: string };

function privateIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b, c] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 2) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113);
}

function privateAddress(address: string) {
  if (isIP(address) === 4) return privateIpv4(address);
  if (isIP(address) !== 6) return true;
  let value = address.toLowerCase().split("%")[0];
  const ipv4Tail = value.match(/(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (ipv4Tail) {
    const octets = ipv4Tail.split(".").map(Number);
    value = value.slice(0, -ipv4Tail.length) + `${((octets[0] << 8) | octets[1]).toString(16)}:${((octets[2] << 8) | octets[3]).toString(16)}`;
  }
  const [head = "", tail = ""] = value.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const words = [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right].map((word) => Number.parseInt(word || "0", 16));
  if (words.length !== 8 || words.some((word) => !Number.isFinite(word))) return true;
  const [first, second] = words;
  const allZero = words.every((word) => word === 0);
  const loopback = words.slice(0, 7).every((word) => word === 0) && words[7] === 1;
  const embeddedIpv4 = words.slice(0, 5).every((word) => word === 0) && (words[5] === 0 || words[5] === 0xffff);
  if (embeddedIpv4) {
    const mapped = `${words[6] >> 8}.${words[6] & 255}.${words[7] >> 8}.${words[7] & 255}`;
    if (privateIpv4(mapped)) return true;
  }
  return allZero || loopback ||
    (first & 0xfe00) === 0xfc00 ||
    (first & 0xffc0) === 0xfe80 ||
    (first & 0xff00) === 0xff00 ||
    (first === 0x2001 && (second === 0 || second === 0x0db8)) ||
    first === 0x2002 ||
    (first === 0x0064 && second === 0xff9b);
}

async function safeAddresses(hostname: string) {
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) throw new Error("Local network addresses cannot be analyzed.");
  if (isIP(hostname)) {
    if (privateAddress(hostname)) throw new Error("Private network addresses cannot be analyzed.");
    return [hostname];
  }
  const [v4, v6] = await Promise.all([resolve4(hostname).catch(() => []), resolve6(hostname).catch(() => [])]);
  const addresses = [...v4, ...v6];
  if (!addresses.length || addresses.some(privateAddress)) throw new Error("The supplied website did not resolve to a safe public address.");
  return addresses;
}

function cleanHtml(html: string) {
  const codePoint = (value: string, radix: number) => {
    const parsed = Number.parseInt(value, radix);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 0x10ffff ? String.fromCodePoint(parsed) : " ";
  };
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const text = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => codePoint(hex, 16))
    .replace(/&#(\d+);/g, (_, decimal: string) => codePoint(decimal, 10))
    .replace(/\s+/g, " ")
    .trim();
  return { title: title.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200), text: text.slice(0, MAX_TEXT) };
}

async function download(url: URL, redirects = 0): Promise<RetrievedPage> {
  if (!new Set(["http:", "https:"]).has(url.protocol) || url.username || url.password) throw new Error("Use a public HTTP or HTTPS website.");
  if ((url.protocol === "http:" && url.port && url.port !== "80") || (url.protocol === "https:" && url.port && url.port !== "443")) throw new Error("Only standard website ports can be analyzed.");
  const addresses = await safeAddresses(url.hostname);
  const address = addresses[0];
  const request = url.protocol === "https:" ? httpsRequest : httpRequest;

  return new Promise((resolve, reject) => {
    const req = request({
      protocol: url.protocol,
      hostname: address,
      port: url.port || undefined,
      path: `${url.pathname}${url.search}`,
      method: "GET",
      servername: url.hostname,
      headers: { Host: url.host, "User-Agent": "MeridianOpportunityAnalyzer/1.0", Accept: "text/html,text/plain;q=0.9", "Accept-Encoding": "identity" },
      timeout: TIMEOUT_MS,
    }, (response) => {
      const status = response.statusCode ?? 0;
      if (status >= 300 && status < 400 && response.headers.location) {
        response.resume();
        if (redirects >= MAX_REDIRECTS) return reject(new Error("The website redirected too many times."));
        return download(new URL(response.headers.location, url), redirects + 1).then(resolve, reject);
      }
      if (status < 200 || status >= 300) { response.resume(); return reject(new Error(`The website returned HTTP ${status}.`)); }
      const type = String(response.headers["content-type"] || "").toLowerCase();
      if (!type.includes("text/html") && !type.includes("text/plain")) { response.resume(); return reject(new Error("The supplied URL is not a readable webpage.")); }
      const chunks: Buffer[] = [];
      let size = 0;
      response.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_BYTES) { req.destroy(new Error("The webpage is too large to analyze safely.")); return; }
        chunks.push(chunk);
      });
      response.on("end", () => {
        const content = Buffer.concat(chunks).toString("utf8");
        const cleaned = type.includes("text/html") ? cleanHtml(content) : { title: "", text: content.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT) };
        if (cleaned.text.length < 80) return reject(new Error("The webpage did not contain enough readable product information."));
        resolve({ url: url.toString(), ...cleaned });
      });
      response.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new Error("The website took too long to respond.")));
    req.on("error", reject);
    req.end();
  });
}

export async function fetchPublicPage(value: string) {
  const normalized = value.match(/^https?:\/\//i) ? value : `https://${value}`;
  return download(new URL(normalized));
}
