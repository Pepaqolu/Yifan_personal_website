import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyPaddleSignature(
  rawBody: string,
  header: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
  tolerance = 5,
) {
  if (!header || !secret) return false;
  const parts = header.split(";").map((part) => part.split("="));
  const timestamp = parts.find(([key]) => key === "ts")?.[1];
  const signatures = parts.filter(([key]) => key === "h1").map(([, value]) => value);
  if (!timestamp || !signatures.length || !/^\d+$/.test(timestamp) || Math.abs(nowSeconds - Number(timestamp)) > tolerance) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}:${rawBody}`).digest("hex");
  return signatures.some((value) => {
    try {
      const calculated = Buffer.from(expected, "hex");
      const supplied = Buffer.from(value, "hex");
      return calculated.length === supplied.length && timingSafeEqual(calculated, supplied);
    } catch {
      return false;
    }
  });
}
