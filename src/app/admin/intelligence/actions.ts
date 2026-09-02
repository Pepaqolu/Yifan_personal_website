"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/china-desk/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { getClientContextSummary } from "@/lib/ai/retrieval";

function value(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function strings(input: unknown) {
  return Array.isArray(input) ? input.filter((item): item is string => typeof item === "string") : [];
}

async function sourceMaterial(form: FormData) {
  const pieces = [value(form, "material")];
  const sourceUrl = value(form, "source_url");
  if (sourceUrl) pieces.push(`Source URL: ${sourceUrl}`);
  const attachment = form.get("attachment");
  if (attachment instanceof File && attachment.size) {
    if (attachment.size > 250_000) throw new Error("The AI source file must be smaller than 250 KB.");
    const supported = attachment.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(attachment.name);
    if (!supported) throw new Error("For AI drafting, upload a text, Markdown, CSV, or JSON file, or paste the document text.");
    pieces.push(`Uploaded document: ${attachment.name}\n${await attachment.text()}`);
  }
  return pieces.filter(Boolean).join("\n\n").slice(0, 20_000);
}

async function recordDraft(
  organizationId: string,
  userId: string,
  feature: string,
  sourceMaterial: string,
  output: object,
  model: string,
  usage: { inputTokens: number; outputTokens: number; totalTokens: number },
  entityType?: string,
  entityId?: string,
) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { error } = await supabase.from("ai_drafts").insert({ organization_id: organizationId, created_by: userId, feature, source_material: sourceMaterial, output, entity_type: entityType || null, entity_id: entityId || null });
  if (error) throw new Error(error.message);
  await admin.from("ai_usage").insert({ organization_id: organizationId, user_id: userId, feature, model, input_tokens: usage.inputTokens, output_tokens: usage.outputTokens, total_tokens: usage.totalTokens, request_key: `${feature}:${crypto.randomUUID()}` });
  revalidatePath("/admin/intelligence");
}

export async function generateResearchDraft(form: FormData) {
  const context = await requireAdmin();
  const organizationId = value(form, "organization_id");
  const material = await sourceMaterial(form);
  if (!organizationId || material.length < 20) throw new Error("Select a client and add source material.");
  const result = await getAIProvider().summarizeResearch({ material, clientContext: await getClientContextSummary(organizationId) });
  await recordDraft(organizationId, context.user.id, "RESEARCH", material, result.value, result.model, result.usage);
}

export async function generateMarketDraft(form: FormData) {
  const context = await requireAdmin();
  const organizationIds = form.getAll("organization_ids").map(String).filter(Boolean).slice(0, 5);
  const material = await sourceMaterial(form);
  if (!organizationIds.length || material.length < 20) throw new Error("Select at least one client and add source material.");
  for (const organizationId of organizationIds) {
    const result = await getAIProvider().generateMarketPulse({ material, clientContext: await getClientContextSummary(organizationId) });
    await recordDraft(organizationId, context.user.id, "MARKET_PULSE", material, result.value, result.model, result.usage);
  }
}

export async function generateCompetitorAssessment(form: FormData) {
  const context = await requireAdmin();
  const organizationId = value(form, "organization_id");
  const entityId = value(form, "entity_id");
  const supabase = await createClient();
  const { data, error } = await supabase.from("competitors").select("*").eq("id", entityId).eq("organization_id", organizationId).single();
  if (error || !data) throw new Error("Competitor not found.");
  const facts = JSON.stringify(data).slice(0, 12_000);
  const result = await getAIProvider().analyzeCompetitor({ facts, clientContext: await getClientContextSummary(organizationId) });
  await recordDraft(organizationId, context.user.id, "COMPETITOR", facts, result.value, result.model, result.usage, "competitor", entityId);
}

export async function generatePartnerAssessment(form: FormData) {
  const context = await requireAdmin();
  const organizationId = value(form, "organization_id");
  const entityId = value(form, "entity_id");
  const supabase = await createClient();
  const { data, error } = await supabase.from("partners").select("*").eq("id", entityId).eq("organization_id", organizationId).single();
  if (error || !data) throw new Error("Partner not found.");
  const facts = JSON.stringify(data).slice(0, 12_000);
  const result = await getAIProvider().analyzePartner({ facts, clientContext: await getClientContextSummary(organizationId) });
  await recordDraft(organizationId, context.user.id, "PARTNER", facts, result.value, result.model, result.usage, "partner", entityId);
}

export async function publishIntelligenceDraft(form: FormData) {
  const context = await requireAdmin();
  const id = value(form, "id");
  const supabase = await createClient();
  const { data: draft, error } = await supabase.from("ai_drafts").select("*").eq("id", id).eq("status", "DRAFT").single();
  if (error || !draft) throw new Error("Draft not found.");
  const output = (draft.output || {}) as Record<string, unknown>;
  let entityId = draft.entity_id as string | null;

  if (draft.feature === "ASK_CHINA") {
    const answer = { ...output, answer: value(form, "answer") || String(output.answer || "") };
    if (!answer.answer.trim()) throw new Error("The client answer cannot be empty.");
    const { error: messageError } = await supabase.from("ai_messages").update({ content: answer.answer, answer, status: "PUBLISHED", reviewed_by: context.user.id, published_at: new Date().toISOString() }).eq("id", draft.entity_id);
    if (messageError) throw new Error(messageError.message);
  } else if (draft.feature === "RESEARCH") {
    const fullContent = [
      value(form, "full_content") || strings(output.keyFindings).map((item) => `• ${item}`).join("\n"),
      strings(output.implications).length ? `\nImplications\n${strings(output.implications).map((item) => `• ${item}`).join("\n")}` : "",
    ].join("\n");
    const { data, error: insertError } = await supabase.from("research_reports").insert({ organization_id: draft.organization_id, title: value(form, "title") || String(output.title || "Research draft"), category: value(form, "category") || "Market", summary: value(form, "summary") || String(output.summary || ""), status: "COMPLETED", full_content: fullContent, sources: [], attachments: [], created_by: context.user.id }).select("id").single();
    if (insertError) throw new Error(insertError.message);
    entityId = data?.id || null;
  } else if (draft.feature === "MARKET_PULSE") {
    const { data, error: insertError } = await supabase.from("market_updates").insert({ organization_id: draft.organization_id, title: value(form, "title") || String(output.headline || "Market update"), summary: value(form, "summary") || String(output.summary || ""), category: value(form, "category") || String(output.category || "Other"), priority: value(form, "priority") || String(output.priority || "MEDIUM"), notes: [output.whyItMatters && `Why it matters: ${output.whyItMatters}`, output.recommendedAction && `Recommended action: ${output.recommendedAction}`].filter(Boolean).join("\n"), published_at: new Date().toISOString(), created_by: context.user.id }).select("id").single();
    if (insertError) throw new Error(insertError.message);
    entityId = data?.id || null;
  } else if (draft.feature === "COMPETITOR") {
    const { error: updateError } = await supabase.from("competitors").update({ ai_assessment: output, ai_assessment_updated_at: new Date().toISOString() }).eq("id", draft.entity_id).eq("organization_id", draft.organization_id);
    if (updateError) throw new Error(updateError.message);
  } else if (draft.feature === "PARTNER") {
    const { error: updateError } = await supabase.from("partners").update({ ai_assessment: output, ai_assessment_updated_at: new Date().toISOString() }).eq("id", draft.entity_id).eq("organization_id", draft.organization_id);
    if (updateError) throw new Error(updateError.message);
  }

  const { error: publishError } = await supabase.from("ai_drafts").update({ status: "PUBLISHED", entity_id: entityId, reviewed_by: context.user.id, reviewed_at: new Date().toISOString() }).eq("id", id).eq("status", "DRAFT");
  if (publishError) throw new Error(publishError.message);
  await supabase.from("activity").insert({ organization_id: draft.organization_id, actor_id: context.user.id, action: `${String(draft.feature).replaceAll("_", " ")} AI draft reviewed and published`, entity_type: "ai_draft", entity_id: id });
  revalidatePath("/admin/intelligence");
  revalidatePath("/desk/app");
  revalidatePath("/desk/app/ask");
  revalidatePath("/desk/app/research");
  revalidatePath("/desk/app/market");
  revalidatePath("/desk/app/competitors");
  revalidatePath("/desk/app/partners");
}

export async function discardIntelligenceDraft(form: FormData) {
  const context = await requireAdmin();
  const supabase = await createClient();
  const id = value(form, "id");
  const { data: draft } = await supabase.from("ai_drafts").select("feature,entity_id").eq("id", id).eq("status", "DRAFT").single();
  if (!draft) throw new Error("Draft not found.");
  if (draft.feature === "ASK_CHINA" && draft.entity_id) {
    await supabase.from("ai_messages").update({ content: "China Desk could not publish a sufficiently reliable answer. Create a research request to close this gap.", answer: null, confidence: "LOW", status: "PUBLISHED", reviewed_by: context.user.id, published_at: new Date().toISOString() }).eq("id", draft.entity_id);
  }
  await supabase.from("ai_drafts").update({ status: "DISCARDED", reviewed_by: context.user.id, reviewed_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/intelligence");
  revalidatePath("/desk/app/ask");
}

export async function setAIResponseMode(form: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const mode = value(form, "mode") === "DIRECT" ? "DIRECT" : "REVIEW";
  await supabase.from("organizations").update({ ai_response_mode: mode }).eq("id", value(form, "organization_id"));
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${value(form, "organization_id")}`);
}
