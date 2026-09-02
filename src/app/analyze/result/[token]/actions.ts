"use server";

import { revalidatePath } from "next/cache";
import { getSnapshotByToken, hashShareToken } from "@/lib/analysis/data";
import { createAdminClient } from "@/lib/supabase/admin";

export async function editSnapshotUnderstanding(token: string, form: FormData) {
  const existing = await getSnapshotByToken(token);
  if (!existing || existing.claimed_by) throw new Error("This snapshot can no longer be edited from its private link.");
  const product = String(form.get("product") ?? "").trim().slice(0, 500);
  const summary = String(form.get("summary") ?? "").trim().slice(0, 700);
  const likelyBuyer = String(form.get("likely_buyer") ?? "").trim().slice(0, 300);
  if (!product || !summary || !likelyBuyer) throw new Error("Complete all three understanding fields.");
  const payload = { ...existing.analysis_payload, companyUnderstanding: { ...existing.analysis_payload.companyUnderstanding, product, summary, likelyBuyer } };
  const supabase = createAdminClient();
  const { error } = await supabase.from("analysis_requests").update({ analysis_payload: payload }).eq("share_token_hash", hashShareToken(token)).is("claimed_by", null);
  if (error) throw new Error("The correction could not be saved.");
  revalidatePath(`/analyze/result/${token}`);
}
