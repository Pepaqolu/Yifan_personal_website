"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { getAIProvider } from "@/lib/ai/provider";
import type { OpportunitySnapshotInput } from "@/lib/ai/types";
import { fetchPublicPage } from "@/lib/analysis/fetch-public-page";
import { validateOpportunitySnapshot } from "@/lib/analysis/snapshot";
import { createAdminClient } from "@/lib/supabase/admin";

export type AnalysisState = { message: string; success?: boolean; requestId?: string; sharePath?: string };

const allowedGoals = new Set(["Customers", "Distributors", "Partners", "Suppliers", "Competitors", "Market entry"]);
const allowedBuyers = new Set(["Hospitals", "Distributors", "Manufacturers", "Retailers", "Enterprises", "Clinics", "Research institutions", "Consumers", "Other"]);
const allowedStatuses = new Set(["Exploring China", "Not yet operating in China", "Already sourcing from China", "Already have distributors", "Already selling in China", "Expanding an existing China business"]);
const allowedIndustries = new Set(["Medical technology", "Healthcare", "Life sciences", "Industrial", "Electronics", "Consumer products", "Software", "Other"]);

function text(form: FormData, key: string, max = 2000) { return String(form.get(key) ?? "").trim().slice(0, max); }
function selections(form: FormData, key: string, allowed: Set<string>) { return form.getAll(key).map(String).filter((value) => allowed.has(value)); }
function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }

async function requestFingerprint() {
  const incoming = await headers();
  const ip = incoming.get("x-vercel-forwarded-for") || incoming.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const agent = incoming.get("user-agent") || "unknown";
  const salt = process.env.ANALYSIS_RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "meridian";
  return createHash("sha256").update(`${salt}:${ip}:${agent}`).digest("hex");
}

export async function submitAnalysisRequest(_: AnalysisState, form: FormData): Promise<AnalysisState> {
  const website = text(form, "website", 500);
  const companyName = text(form, "company_name", 200);
  const description = text(form, "description", 5000);
  const industry = text(form, "industry", 160);
  const goals = selections(form, "goals", allowedGoals);
  const buyers = selections(form, "buyers", allowedBuyers);
  const buyerCustom = text(form, "buyer_custom", 500);
  const chinaStatus = text(form, "china_status", 160);
  const additionalContext = text(form, "additional_context", 4000);

  if ((!website && description.length < 20) || !allowedIndustries.has(industry) || !goals.length || (!buyers.length && !buyerCustom) || !allowedStatuses.has(chinaStatus)) {
    return { message: "Complete the required product, goal, industry, buyer and China-status fields." };
  }

  let normalizedUrl = "";
  if (website) {
    try {
      const parsed = new URL(website.match(/^https?:\/\//i) ? website : `https://${website}`);
      if (!new Set(["http:", "https:"]).has(parsed.protocol)) throw new Error();
      normalizedUrl = parsed.toString();
    } catch {
      return { message: "Enter a valid public company or product URL, or remove it and describe the product manually." };
    }
  }

  try {
    const supabase = createAdminClient();
    const fingerprint = await requestFingerprint();
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase.from("analysis_requests").select("id", { count: "exact", head: true }).eq("request_fingerprint", fingerprint).gte("created_at", since);
    if ((count ?? 0) >= 5) return { message: "You have generated several snapshots recently. Please wait a little before trying again." };

    const { data: request, error: insertError } = await supabase.from("analysis_requests").insert({
      company_website: normalizedUrl || null,
      company_name: companyName || null,
      goals,
      product_description: description || "",
      industry,
      target_audiences: buyers,
      target_buyer_custom: buyerCustom || null,
      china_status: chinaStatus,
      additional_context: additionalContext || null,
      status: "PREPARING",
      request_fingerprint: fingerprint,
    }).select("id").single();
    if (insertError || !request) throw insertError ?? new Error("The analysis could not be started.");

    let retrievedPage: OpportunitySnapshotInput["retrievedPage"];
    let retrievalLimitation = "";
    if (normalizedUrl) {
      try { retrievedPage = await fetchPublicPage(normalizedUrl); }
      catch (error) { retrievalLimitation = error instanceof Error ? error.message : "The supplied website could not be read."; }
    }
    if (!retrievedPage && description.length < 20) {
      await supabase.from("analysis_requests").update({ status: "SUBMITTED", generation_error: retrievalLimitation || "No readable product context was available." }).eq("id", request.id);
      return { message: `${retrievalLimitation || "The website could not be read"} Add a short product description and try again.` };
    }

    const input: OpportunitySnapshotInput = { companyWebsite: normalizedUrl, companyName, productDescription: description, industry, goals, targetBuyers: buyers, targetBuyerCustom: buyerCustom, chinaStatus, additionalContext, retrievedPage, retrievalLimitation: retrievalLimitation || undefined };
    try {
      const generated = await getAIProvider().generateOpportunitySnapshot(input);
      const snapshot = validateOpportunitySnapshot(generated.value);
      const shareToken = randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { error: updateError } = await supabase.from("analysis_requests").update({
        source_snapshot: retrievedPage ?? null,
        analysis_payload: snapshot,
        status: "READY",
        generated_at: new Date().toISOString(),
        ai_model: generated.model,
        generation_error: retrievalLimitation || null,
        share_token_hash: tokenHash(shareToken),
        share_token_expires_at: expiresAt,
      }).eq("id", request.id);
      if (updateError) throw updateError;
      return { message: "Your China Opportunity Snapshot is ready.", success: true, requestId: request.id, sharePath: `/analyze/result/${shareToken}` };
    } catch (error) {
      const message = error instanceof Error ? error.message : "The analysis engine did not return a usable result.";
      await supabase.from("analysis_requests").update({ status: "SUBMITTED", generation_error: message.slice(0, 1000), source_snapshot: retrievedPage ?? null }).eq("id", request.id);
      console.error("Snapshot generation failed", error);
      return { message: message.includes("timeout") || message.includes("aborted") ? "The analysis took too long. Your input is safe—please try again." : "The analysis engine could not complete this snapshot. Please try again." };
    }
  } catch (error) {
    console.error("Analysis request failed", error);
    return { message: "We could not start your analysis. Please try again shortly." };
  }
}
