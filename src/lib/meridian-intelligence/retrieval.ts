import "server-only";
import { fetchPublicPage } from "@/lib/analysis/fetch-public-page";
import type { SourceClassification } from "./types";

const authoritative = ["nmpa.gov.cn", "samr.gov.cn", "gov.cn", "ccgp.gov.cn"];
const market = ["1688.com", "alibaba.com"];

export function classifySource(value: string): SourceClassification {
  const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  if (authoritative.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) return {
    sourceType: "AUTHORITATIVE", authorityLevel: "PRIMARY", regulatoryAuthority: hostname.includes("nmpa") || hostname.includes("samr"), commercialSignalStrength: hostname.includes("ccgp") ? "HIGH" : "NONE", status: "ACTIVE",
  };
  if (market.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) return {
    sourceType: "MARKET", authorityLevel: "LOW", regulatoryAuthority: false, commercialSignalStrength: "MEDIUM", status: "LIMITED",
  };
  return { sourceType: "COMMERCIAL", authorityLevel: "MEDIUM", regulatoryAuthority: false, commercialSignalStrength: "HIGH", status: "ACTIVE" };
}

export async function retrieveIntelligencePage(url: string) {
  const page = await fetchPublicPage(url);
  return { ...page, retrievedAt: new Date().toISOString(), classification: classifySource(page.url) };
}

