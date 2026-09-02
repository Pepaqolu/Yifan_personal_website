"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { productConfig } from "@/config/productConfig";

export type AnalysisState = { message: string; success?: boolean; requestId?: string };

const allowedGoals = new Set(["Customers", "Distributors", "Partners", "Suppliers", "Market entry", "Competitor intelligence"]);
const allowedAudiences = new Set(["Hospitals", "Distributors", "Manufacturers", "Retailers", "Businesses", "Consumers", "Other"]);
const allowedStatuses = new Set(["Not in China yet", "Researching the market", "Already have suppliers", "Already have distributors", "Already selling in China"]);

function text(form: FormData, key: string, max = 2000) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

function selections(form: FormData, key: string, allowed: Set<string>) {
  return form.getAll(key).map(String).filter((value) => allowed.has(value));
}

export async function submitAnalysisRequest(_: AnalysisState, form: FormData): Promise<AnalysisState> {
  const website = text(form, "website", 500);
  const companyName = text(form, "company_name", 200);
  const description = text(form, "description", 4000);
  const industry = text(form, "industry", 160);
  const goals = selections(form, "goals", allowedGoals);
  const audiences = selections(form, "audiences", allowedAudiences);
  const chinaStatus = text(form, "china_status", 120);

  if (!website || !description || !industry || !goals.length || !audiences.length || !allowedStatuses.has(chinaStatus)) {
    return { message: "Please complete every required step before generating your opportunity map." };
  }

  try {
    new URL(website.startsWith("http") ? website : `https://${website}`);
  } catch {
    return { message: "Enter a valid company website or product URL." };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("analysis_requests").insert({
      company_website: website,
      company_name: companyName || null,
      goals,
      product_description: description,
      industry,
      target_audiences: audiences,
      china_status: chinaStatus,
      status: "SUBMITTED",
    }).select("id").single();

    if (error || !data) throw error ?? new Error("The request was not saved.");
    return { message: `Your ${productConfig.shortName} analysis is being prepared.`, success: true, requestId: data.id };
  } catch (error) {
    console.error("Analysis request failed", error);
    return { message: "We could not save your analysis request. Please try again or contact Yifan directly." };
  }
}
