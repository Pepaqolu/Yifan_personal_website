import { createClient } from "@supabase/supabase-js";

const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SEED_ADMIN_EMAIL", "SEED_ADMIN_PASSWORD", "SEED_CLIENT_EMAIL", "SEED_CLIENT_PASSWORD"];
for (const key of required) if (!process.env[key]) throw new Error(`Missing ${key}`);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
async function ensureUser(email, password, role, firstName) {
  const { data: listed } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  let user = listed.users.find((candidate) => candidate.email === email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { first_name: firstName } });
    if (error) throw error;
    user = data.user;
  }
  const { error: profileError } = await supabase.from("profiles").upsert({ id: user.id, first_name: firstName, role });
  if (profileError) throw profileError;
  return user;
}

const admin = await ensureUser(process.env.SEED_ADMIN_EMAIL, process.env.SEED_ADMIN_PASSWORD, "ADMIN", "Yifan");
const client = await ensureUser(process.env.SEED_CLIENT_EMAIL, process.env.SEED_CLIENT_PASSWORD, "CLIENT", "Alex");
const { error } = await supabase.from("organization_members").upsert({ organization_id: "10000000-0000-0000-0000-000000000001", user_id: client.id, title: "Head of International Sales" });
if (error) throw error;
const organizationId = "10000000-0000-0000-0000-000000000001";
await supabase.from("organizations").update({ ai_response_mode: "REVIEW", onboarding_completed_at: new Date().toISOString() }).eq("id", organizationId);

const conversations = [
  { id: "20000000-0000-0000-0000-000000000001", organization_id: organizationId, user_id: client.id, title: "Priority partner assessment" },
  { id: "20000000-0000-0000-0000-000000000002", organization_id: organizationId, user_id: client.id, title: "Unknown company check" },
  { id: "20000000-0000-0000-0000-000000000003", organization_id: organizationId, user_id: client.id, title: "Local outreach" },
  { id: "20000000-0000-0000-0000-000000000004", organization_id: organizationId, user_id: client.id, title: "Pricing assumption" },
];
const { error: conversationError } = await supabase.from("ai_conversations").upsert(conversations);
if (conversationError) throw conversationError;

const mediumAnswer = {
  answer: "The stored fictional evidence points to qualification depth—not list size—as the immediate partner priority.",
  whatWeKnow: ["One partner is active and two are qualified in the fictional pipeline."],
  assessment: ["Focus the next review on coverage, references, and decision-maker access."],
  missingInformation: ["Verified provincial coverage and reference checks"],
  sourceKeys: ["partner:fixture", "knowledge:fixture"], confidence: "MEDIUM",
  requiresLocalExecution: false, localExecutionReason: "", suggestedRequestTitle: "Validate partner coverage", suggestedRequestType: "Find partners",
};
const lowAnswer = {
  answer: "We don't have enough client-specific evidence to assess this company yet.", whatWeKnow: [], assessment: [],
  missingInformation: ["Company identity, source material, and relevance to the client"], sourceKeys: [], confidence: "LOW",
  requiresLocalExecution: false, localExecutionReason: "", suggestedRequestTitle: "Research the unknown company", suggestedRequestType: "Research a company",
};
const localAnswer = {
  answer: "The stored record supports preparing an outreach brief, but a current WeChat introduction requires China-side execution.",
  whatWeKnow: ["The fictional partner is marked qualified."], assessment: ["A structured introduction is the next sensible step."],
  missingInformation: ["Current decision-maker availability"], sourceKeys: ["partner:fixture"], confidence: "MEDIUM",
  requiresLocalExecution: true, localExecutionReason: "A live China-side introduction and response check are required.", suggestedRequestTitle: "Contact qualified partner", suggestedRequestType: "Contact someone",
};
const reviewAnswer = { ...mediumAnswer, answer: "Draft: the stored pricing evidence should be validated before changing the China strategy." };
const messages = [
  { id: "21000000-0000-0000-0000-000000000001", conversation_id: conversations[0].id, organization_id: organizationId, user_id: client.id, role: "USER", content: "Which partners look most promising?", status: "PUBLISHED", published_at: new Date().toISOString() },
  { id: "21000000-0000-0000-0000-000000000002", conversation_id: conversations[0].id, organization_id: organizationId, user_id: client.id, role: "ASSISTANT", content: mediumAnswer.answer, answer: mediumAnswer, status: "PUBLISHED", confidence: "MEDIUM", source_references: [{ key: "partner:fixture", kind: "PARTNER", id: "fixture-partner", title: "Fictional partner records" }], published_at: new Date().toISOString() },
  { id: "21000000-0000-0000-0000-000000000003", conversation_id: conversations[1].id, organization_id: organizationId, user_id: client.id, role: "USER", content: "What do we know about Unknown Company Z?", status: "PUBLISHED", published_at: new Date().toISOString() },
  { id: "21000000-0000-0000-0000-000000000004", conversation_id: conversations[1].id, organization_id: organizationId, user_id: client.id, role: "ASSISTANT", content: lowAnswer.answer, answer: lowAnswer, status: "PUBLISHED", confidence: "LOW", source_references: [], published_at: new Date().toISOString() },
  { id: "21000000-0000-0000-0000-000000000005", conversation_id: conversations[2].id, organization_id: organizationId, user_id: client.id, role: "USER", content: "Can you contact the qualified partner on WeChat?", status: "PUBLISHED", published_at: new Date().toISOString() },
  { id: "21000000-0000-0000-0000-000000000006", conversation_id: conversations[2].id, organization_id: organizationId, user_id: client.id, role: "ASSISTANT", content: localAnswer.answer, answer: localAnswer, status: "PUBLISHED", confidence: "MEDIUM", requires_local_execution: true, source_references: [{ key: "partner:fixture", kind: "PARTNER", id: "fixture-partner", title: "Fictional partner record" }], published_at: new Date().toISOString() },
  { id: "21000000-0000-0000-0000-000000000007", conversation_id: conversations[3].id, organization_id: organizationId, user_id: client.id, role: "USER", content: "Does our pricing assumption still hold?", status: "PUBLISHED", published_at: new Date().toISOString() },
  { id: "21000000-0000-0000-0000-000000000008", conversation_id: conversations[3].id, organization_id: organizationId, user_id: client.id, role: "ASSISTANT", content: reviewAnswer.answer, answer: reviewAnswer, status: "DRAFT", confidence: "MEDIUM", source_references: [{ key: "knowledge:fixture", kind: "CLIENT_INFORMATION", id: "fixture-knowledge", title: "Fictional pricing context" }] },
];
const { error: messageError } = await supabase.from("ai_messages").upsert(messages);
if (messageError) throw messageError;
const [{ data: competitor }, { data: partner }] = await Promise.all([
  supabase.from("competitors").select("id").eq("organization_id", organizationId).eq("company_name", "Demo Medical A").limit(1).maybeSingle(),
  supabase.from("partners").select("id").eq("organization_id", organizationId).eq("company_name", "Example East Healthcare").limit(1).maybeSingle(),
]);
const drafts = [
  { id: "22000000-0000-0000-0000-000000000001", organization_id: organizationId, created_by: admin.id, feature: "ASK_CHINA", entity_type: "ai_message", entity_id: messages[7].id, source_material: "Fictional pricing context", output: reviewAnswer, status: "DRAFT" },
  { id: "22000000-0000-0000-0000-000000000002", organization_id: organizationId, created_by: admin.id, feature: "RESEARCH", source_material: "Fictional distributor interview notes.", output: { title: "Fictional distributor qualification", summary: "Illustrative notes suggest coverage must be validated.", keyFindings: ["Coverage claims remain unverified"], implications: ["Request references before progressing"], companiesMentioned: [], potentialCompetitors: [], potentialPartners: ["Example East Healthcare"], tags: ["fixture", "partners"], followUpQuestions: ["Which provinces have active accounts?"] }, status: "DRAFT" },
  { id: "22000000-0000-0000-0000-000000000003", organization_id: organizationId, created_by: admin.id, feature: "MARKET_PULSE", source_material: "Derived from the fictional distributor research draft.", output: { headline: "Distributor coverage claims need validation", summary: "Fictional research indicates that stated coverage may not equal active account access.", category: "Partner", whyItMatters: "Partner selection depends on reachable customers, not nominal geography.", priority: "MEDIUM", recommendedAction: "Verify references before advancing." }, status: "DRAFT" },
  { id: "22000000-0000-0000-0000-000000000004", organization_id: organizationId, created_by: admin.id, feature: "COMPETITOR", entity_type: "competitor", entity_id: competitor?.id, source_material: "Fictional competitor record.", output: { positioning: "Mid-market local responsiveness", strengths: ["Local engineering"], weaknesses: ["Not established in fixture data"], recentActivity: "Fictional product tier announced", potentialThreat: "Could increase mid-market pricing pressure", questionsToInvestigate: ["Validate channel adoption"], evidenceLimitations: ["Fictional development data only"] }, status: "DRAFT" },
  { id: "22000000-0000-0000-0000-000000000005", organization_id: organizationId, created_by: admin.id, feature: "PARTNER", entity_type: "partner", entity_id: partner?.id, source_material: "Fictional partner record.", output: { fit: "MEDIUM", rationale: "The stored segment fit is promising but coverage is unverified.", concerns: ["References not yet checked"], questionsToVerify: ["Confirm active provincial accounts"], recommendedNextAction: "Run a structured qualification call", evidenceLimitations: ["Fictional development data only"] }, status: "DRAFT" },
];
const { error: draftError } = await supabase.from("ai_drafts").upsert(drafts);
if (draftError) throw draftError;
const { error: requestError } = await supabase.from("requests").upsert({ id: "23000000-0000-0000-0000-000000000001", organization_id: organizationId, title: "Research: Unknown Company Z", description: "Created from Ask China.\n\nQuestion: What do we know about Unknown Company Z?", request_type: "Research a company", priority: "MEDIUM", status: "SUBMITTED", created_by: client.id });
if (requestError) throw requestError;
console.log(`Seeded admin ${admin.email} and client ${client.email}.`);
