import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { EvidenceItem, EvidenceKind } from "./types";

const STOP_WORDS = new Set([
  "about", "after", "again", "china", "could", "does", "from", "have", "into",
  "know", "most", "our", "should", "that", "the", "their", "this", "what",
  "when", "where", "which", "with", "would", "your",
]);

function tokens(value: string) {
  return [...new Set(value.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) || [])]
    .filter((token) => !STOP_WORDS.has(token))
    .slice(0, 24);
}

function clean(parts: unknown[]) {
  return parts
    .flatMap((part) => Array.isArray(part) ? part : [part])
    .filter((part) => typeof part === "string" && part.trim())
    .join(" · ")
    .slice(0, 2800);
}

function relevance(questionTokens: string[], title: string, content: string, date?: string) {
  const haystack = `${title} ${content}`.toLowerCase();
  const lexical = questionTokens.reduce((score, token) => score + (haystack.includes(token) ? 5 : 0), 0);
  const recent = date && Date.now() - new Date(date).getTime() < 45 * 86400000 ? 1 : 0;
  return lexical + recent;
}

function evidence(
  kind: EvidenceKind,
  row: Record<string, unknown>,
  title: string,
  content: string,
  questionTokens: string[],
  date?: string,
  sourceName?: string,
  sourceUrl?: string,
): EvidenceItem {
  const id = String(row.id);
  return {
    key: `${kind}:${id}`,
    kind,
    id,
    title,
    content,
    date,
    sourceName,
    sourceUrl,
    score: relevance(questionTokens, title, content, date),
  };
}

export async function retrieveOrganizationEvidence(organizationId: string, question: string) {
  const supabase = await createClient();
  const questionTokens = tokens(question);
  const [organization, knowledge, research, market, competitors, partners, requests, activity] = await Promise.all([
    supabase.from("organizations").select("id,name,slug").eq("id", organizationId).single(),
    supabase.from("knowledge_items").select("id,title,category,content,tags,source,updated_at").eq("organization_id", organizationId).order("updated_at", { ascending: false }).limit(40),
    supabase.from("research_reports").select("id,title,category,summary,full_content,sources,updated_at").eq("organization_id", organizationId).eq("status", "COMPLETED").order("updated_at", { ascending: false }).limit(20),
    supabase.from("market_updates").select("id,title,summary,category,notes,source_name,source_url,published_at").eq("organization_id", organizationId).not("published_at", "is", null).order("published_at", { ascending: false }).limit(30),
    supabase.from("competitors").select("id,company_name,chinese_name,segment,description,products,pricing_notes,positioning,recent_activity,external_client_notes,sources,updated_at").eq("organization_id", organizationId).order("updated_at", { ascending: false }).limit(30),
    supabase.from("partners").select("id,company_name,chinese_name,partner_type,location,english_ability,interest_level,status,last_contact,notes,source,updated_at").eq("organization_id", organizationId).order("updated_at", { ascending: false }).limit(40),
    supabase.from("requests").select("id,title,description,request_type,status,updates,updated_at").eq("organization_id", organizationId).order("updated_at", { ascending: false }).limit(20),
    supabase.from("activity").select("id,action,entity_type,metadata,created_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(20),
  ]);

  const errors = [organization, knowledge, research, market, competitors, partners, requests, activity]
    .map((result) => result.error)
    .filter(Boolean);
  if (errors.length) throw new Error("China Desk could not retrieve the authorized client context.");

  const items: EvidenceItem[] = [];
  if (organization.data) {
    items.push(evidence("ORGANIZATION", organization.data, organization.data.name, `Organization: ${organization.data.name}`, questionTokens));
  }
  for (const row of knowledge.data || []) {
    items.push(evidence("CLIENT_INFORMATION", row, `${row.category}: ${row.title}`, clean([row.content, row.tags, row.source]), questionTokens, row.updated_at));
  }
  for (const row of research.data || []) {
    items.push(evidence("RESEARCH", row, row.title, clean([row.category, row.summary, row.full_content, row.sources]), questionTokens, row.updated_at));
  }
  for (const row of market.data || []) {
    items.push(evidence("MARKET_UPDATE", row, row.title, clean([row.category, row.summary, row.notes]), questionTokens, row.published_at || undefined, row.source_name || undefined, row.source_url || undefined));
  }
  for (const row of competitors.data || []) {
    items.push(evidence("COMPETITOR", row, row.company_name, clean([row.chinese_name, row.segment, row.description, row.products, row.pricing_notes, row.positioning, row.recent_activity, row.external_client_notes, row.sources]), questionTokens, row.updated_at));
  }
  for (const row of partners.data || []) {
    items.push(evidence("PARTNER", row, row.company_name, clean([row.chinese_name, row.partner_type, row.location, row.english_ability, row.interest_level, row.status, row.last_contact, row.notes, row.source]), questionTokens, row.updated_at));
  }
  for (const row of requests.data || []) {
    items.push(evidence("REQUEST", row, row.title, clean([row.request_type, row.status, row.description, row.updates]), questionTokens, row.updated_at));
  }
  for (const row of activity.data || []) {
    items.push(evidence("ACTIVITY", row, row.action, clean([row.entity_type, row.metadata]), questionTokens, row.created_at));
  }

  const kindPriority: Record<EvidenceKind, number> = {
    CLIENT_INFORMATION: 6,
    RESEARCH: 5,
    MARKET_UPDATE: 4,
    COMPETITOR: 4,
    PARTNER: 4,
    REQUEST: 2,
    ACTIVITY: 1,
    ORGANIZATION: 3,
  };
  const ranked = items.sort((a, b) => (b.score + kindPriority[b.kind]) - (a.score + kindPriority[a.kind]));
  const selected: EvidenceItem[] = [];
  let characters = 0;
  for (const item of ranked) {
    if (selected.length >= 14 || characters + item.content.length > 16_000) continue;
    selected.push(item);
    characters += item.content.length;
  }
  return selected;
}

export async function getClientContextSummary(organizationId: string) {
  const evidence = await retrieveOrganizationEvidence(organizationId, "company products customers goals pricing strategy constraints decisions");
  return evidence
    .filter((item) => ["CLIENT_INFORMATION", "ORGANIZATION", "RESEARCH"].includes(item.kind))
    .slice(0, 10)
    .map((item) => `[${item.kind}] ${item.title}: ${item.content}`)
    .join("\n")
    .slice(0, 10_000);
}
