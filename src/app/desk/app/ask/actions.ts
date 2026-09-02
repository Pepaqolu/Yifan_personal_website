"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { retrieveOrganizationEvidence } from "@/lib/ai/retrieval";
import type { AskChinaAnswer } from "@/lib/ai/types";
import { requestTypes } from "@/lib/china-desk/constants";

export type AskState = {
  message: string;
  success?: boolean;
  conversationId?: string;
};

function value(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeAnswer(raw: AskChinaAnswer, allowedKeys: Set<string>, evidenceCount: number): AskChinaAnswer {
  const confidence = ["HIGH", "MEDIUM", "LOW"].includes(raw.confidence) ? raw.confidence : "LOW";
  const sourceKeys = Array.isArray(raw.sourceKeys)
    ? raw.sourceKeys.filter((key) => allowedKeys.has(String(key))).map(String)
    : [];
  return {
    answer: String(raw.answer || "We don't have enough client-specific evidence to answer this confidently yet.").slice(0, 6000),
    whatWeKnow: Array.isArray(raw.whatWeKnow) ? raw.whatWeKnow.map(String).slice(0, 8) : [],
    assessment: Array.isArray(raw.assessment) ? raw.assessment.map(String).slice(0, 8) : [],
    missingInformation: Array.isArray(raw.missingInformation) ? raw.missingInformation.map(String).slice(0, 8) : [],
    sourceKeys,
    confidence: evidenceCount < 2 || sourceKeys.length === 0 ? "LOW" : confidence,
    requiresLocalExecution: Boolean(raw.requiresLocalExecution),
    localExecutionReason: String(raw.localExecutionReason || "").slice(0, 1000),
    suggestedRequestTitle: String(raw.suggestedRequestTitle || "Research this question").slice(0, 160),
    suggestedRequestType: requestTypes.includes(raw.suggestedRequestType as (typeof requestTypes)[number]) ? raw.suggestedRequestType : "Market question",
  };
}

export async function askChina(_: AskState, form: FormData): Promise<AskState> {
  const context = await requireWorkspace();
  if (!context.organization) return { message: "No client workspace is assigned." };
  const question = value(form, "question");
  if (question.length < 5) return { message: "Ask a little more specifically." };
  if (question.length > 800) return { message: "Keep the question under 800 characters." };

  const supabase = await createClient();
  const admin = createAdminClient();
  const organizationId = context.organization.id;
  let conversationId = value(form, "conversation_id");

  if (conversationId) {
    const { data } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("organization_id", organizationId)
      .eq("user_id", context.user.id)
      .single();
    if (!data) return { message: "That conversation is unavailable." };
  } else {
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({ organization_id: organizationId, user_id: context.user.id, title: question.slice(0, 72) })
      .select("id")
      .single();
    if (error || !data) return { message: "A conversation could not be started." };
    conversationId = data.id;
  }

  const { error: messageError } = await supabase.from("ai_messages").insert({
    conversation_id: conversationId,
    organization_id: organizationId,
    user_id: context.user.id,
    role: "USER",
    content: question,
    status: "PUBLISHED",
    published_at: new Date().toISOString(),
  });
  if (messageError) return { message: "Your question could not be saved." };

  const since = new Date(Date.now() - 86400000).toISOString();
  const { count } = await admin
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("user_id", context.user.id)
    .gte("created_at", since);
  if ((count || 0) >= 50) return { message: "The daily Ask China limit has been reached. Please contact Yifan." };

  const requestKey = `ask:${organizationId}:${context.user.id}:${Math.floor(Date.now() / 300000)}:${await digest(question.toLowerCase())}`;
  const { data: reservation, error: reservationError } = await admin
    .from("ai_usage")
    .insert({ organization_id: organizationId, user_id: context.user.id, feature: "ASK_CHINA", model: "pending", request_key: requestKey })
    .select("id")
    .single();
  if (reservationError || !reservation) {
    return { message: "This question is already being processed.", conversationId };
  }

  try {
    const [evidence, historyResult, modeResult] = await Promise.all([
      retrieveOrganizationEvidence(organizationId, question),
      supabase.from("ai_messages").select("role,content").eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(8),
      supabase.from("organizations").select("ai_response_mode").eq("id", organizationId).single(),
    ]);
    const history = (historyResult.data || []).reverse().map((message) => ({
      role: message.role as "USER" | "ASSISTANT",
      content: message.content,
    }));
    const result = await getAIProvider().generateAnswer({ question, evidence, history });
    const answer = safeAnswer(result.value, new Set(evidence.map((item) => item.key)), evidence.length);
    const sources = evidence
      .filter((item) => answer.sourceKeys.includes(item.key))
      .map(({ key, kind, id, title, sourceName, sourceUrl }) => ({ key, kind, id, title, sourceName, sourceUrl: sourceUrl && /^https?:\/\//i.test(sourceUrl) ? sourceUrl : undefined }));
    const review = modeResult.data?.ai_response_mode !== "DIRECT";
    const { data: assistant, error: assistantError } = await admin
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        organization_id: organizationId,
        user_id: context.user.id,
        role: "ASSISTANT",
        content: answer.answer,
        answer,
        status: review ? "DRAFT" : "PUBLISHED",
        source_references: sources,
        confidence: answer.confidence,
        requires_local_execution: answer.requiresLocalExecution,
        published_at: review ? null : new Date().toISOString(),
      })
      .select("id")
      .single();
    if (assistantError || !assistant) throw new Error("The answer could not be saved.");

    if (review) {
      const { error: draftError } = await admin.from("ai_drafts").insert({
        organization_id: organizationId,
        created_by: context.user.id,
        feature: "ASK_CHINA",
        entity_type: "ai_message",
        entity_id: assistant.id,
        source_material: question,
        output: answer,
      });
      if (draftError) {
        await admin.from("ai_messages").delete().eq("id", assistant.id);
        throw new Error("The review draft could not be saved.");
      }
    }
    await Promise.all([
      admin.from("ai_usage").update({ model: result.model, input_tokens: result.usage.inputTokens, output_tokens: result.usage.outputTokens, total_tokens: result.usage.totalTokens }).eq("id", reservation.id),
      admin.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId),
    ]);
    revalidatePath("/desk/app/ask");
    revalidatePath("/admin/intelligence");
    return { message: review ? "China Desk is reviewing this response." : "Answer ready.", success: true, conversationId };
  } catch {
    await admin.from("ai_usage").update({ model: "failed" }).eq("id", reservation.id);
    await admin.from("ai_messages").insert({
      conversation_id: conversationId,
      organization_id: organizationId,
      user_id: context.user.id,
      role: "ASSISTANT",
      content: "China Desk could not prepare a reliable answer. No unsupported response has been published.",
      status: "PUBLISHED",
      confidence: "LOW",
      published_at: new Date().toISOString(),
    });
    return { message: "China Desk could not prepare a reliable answer. Try again or create a research request.", conversationId };
  }
}

export async function createAskChinaRequest(form: FormData) {
  const context = await requireWorkspace();
  if (!context.organization) return;
  const question = value(form, "question").slice(0, 800);
  const localExecution = value(form, "local_execution") === "true";
  const title = value(form, "title").slice(0, 160) || `${localExecution ? "China-side action" : "Research"}: ${question.slice(0, 120)}`;
  const requestedType = value(form, "request_type");
  const requestType = requestTypes.includes(requestedType as (typeof requestTypes)[number]) ? requestedType : (localExecution ? "Contact someone" : "Market question");
  const supabase = await createClient();
  const { data, error } = await supabase.from("requests").insert({
    organization_id: context.organization.id,
    title,
    description: `Created from Ask China.\n\nQuestion: ${question}`,
    request_type: requestType,
    priority: "MEDIUM",
    status: "SUBMITTED",
    created_by: context.user.id,
  }).select("id").single();
  if (error || !data) throw new Error("The request could not be created.");
  await supabase.from("activity").insert({ organization_id: context.organization.id, actor_id: context.user.id, action: `${localExecution ? "China-side action" : "Research request"} created from Ask China: ${title}`, entity_type: "request", entity_id: data.id });
  revalidatePath("/desk/app/requests");
  revalidatePath("/desk/app/ask");
}

export async function renameConversation(form: FormData) {
  const context = await requireWorkspace();
  if (!context.organization) return;
  const supabase = await createClient();
  await supabase.from("ai_conversations").update({ title: value(form, "title").slice(0, 100) }).eq("id", value(form, "id")).eq("user_id", context.user.id).eq("organization_id", context.organization.id);
  revalidatePath("/desk/app/ask");
}

export async function archiveConversation(form: FormData) {
  const context = await requireWorkspace();
  if (!context.organization) return;
  const supabase = await createClient();
  await supabase.from("ai_conversations").update({ status: "ARCHIVED" }).eq("id", value(form, "id")).eq("user_id", context.user.id).eq("organization_id", context.organization.id);
  revalidatePath("/desk/app/ask");
}

export async function deleteConversation(form: FormData) {
  const context = await requireWorkspace();
  if (!context.organization) return;
  const supabase = await createClient();
  await supabase.from("ai_conversations").delete().eq("id", value(form, "id")).eq("user_id", context.user.id).eq("organization_id", context.organization.id);
  revalidatePath("/desk/app/ask");
}
