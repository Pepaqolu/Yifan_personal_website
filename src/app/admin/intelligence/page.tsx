import { OrganizationField, SelectField, Submit, Textarea } from "@/components/china-desk-app/admin-fields";
import { EmptyState, PageHeader, Status, formatDate } from "@/components/china-desk-app/ui";
import { getOrganizations } from "@/lib/china-desk/data";
import { requireAdmin } from "@/lib/china-desk/auth";
import { createClient } from "@/lib/supabase/server";
import {
  discardIntelligenceDraft,
  generateMarketDraft,
  generateResearchDraft,
  publishIntelligenceDraft,
} from "./actions";

type Draft = {
  id: string;
  organization_id: string;
  feature: "ASK_CHINA" | "RESEARCH" | "MARKET_PULSE" | "COMPETITOR" | "PARTNER";
  output: Record<string, unknown>;
  source_material: string | null;
  created_at: string;
  organizations: { name: string } | { name: string }[];
};

type ClientQuestion = {
  id: string;
  content: string;
  created_at: string;
  organizations: { name: string } | { name: string }[];
};

function text(output: Record<string, unknown>, key: string) {
  return typeof output[key] === "string" ? output[key] : "";
}

function list(output: Record<string, unknown>, key: string) {
  return Array.isArray(output[key]) ? (output[key] as unknown[]).filter((item): item is string => typeof item === "string") : [];
}

function frequentTopics(questions: ClientQuestion[]) {
  const ignored = new Set(["about", "china", "could", "does", "from", "have", "know", "most", "our", "should", "that", "the", "their", "this", "what", "when", "where", "which", "with", "would", "your"]);
  const counts = new Map<string, number>();
  for (const question of questions) for (const token of question.content.toLowerCase().match(/[a-z]{4,}/g) || []) if (!ignored.has(token)) counts.set(token, (counts.get(token) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([topic]) => topic);
}

function DraftEditor({ draft }: { draft: Draft }) {
  const output = draft.output || {};
  const org = Array.isArray(draft.organizations) ? draft.organizations[0] : draft.organizations;
  const fullResearch = [list(output, "keyFindings").map((item) => `• ${item}`).join("\n"), list(output, "implications").length ? `Implications\n${list(output, "implications").map((item) => `• ${item}`).join("\n")}` : ""].filter(Boolean).join("\n\n");

  return (
    <article className="border-t border-line py-8">
      <div className="grid gap-4 md:grid-cols-12 md:items-start">
        <div className="md:col-span-3">
          <Status>{draft.feature}</Status>
          <p className="mt-3 text-sm font-medium">{org?.name || "Client"}</p>
          <p className="mt-2 text-xs text-stone">{formatDate(draft.created_at)}</p>
        </div>
        <div className="md:col-span-9">
          <form action={publishIntelligenceDraft} className="space-y-6">
            <input type="hidden" name="id" value={draft.id} />
            {draft.feature === "ASK_CHINA" ? <Textarea label="Client answer" name="answer" defaultValue={text(output, "answer")} rows={9} required /> : null}
            {draft.feature === "RESEARCH" ? <>
              <Textarea label="Title" name="title" defaultValue={text(output, "title")} rows={2} required />
              <Textarea label="Summary" name="summary" defaultValue={text(output, "summary")} rows={4} required />
              <Textarea label="Full research" name="full_content" defaultValue={fullResearch} rows={12} required />
              <input type="hidden" name="category" value="Market" />
            </> : null}
            {draft.feature === "MARKET_PULSE" ? <>
              <Textarea label="Headline" name="title" defaultValue={text(output, "headline")} rows={2} required />
              <Textarea label="Summary" name="summary" defaultValue={text(output, "summary")} rows={5} required />
              <div className="grid gap-6 sm:grid-cols-2">
                <SelectField label="Category" name="category" value={text(output, "category") || "Other"} options={["Market", "Competitor", "Regulation", "Pricing", "Partner", "Customer", "Other"]} />
                <SelectField label="Priority" name="priority" value={text(output, "priority") || "MEDIUM"} options={["LOW", "MEDIUM", "HIGH", "URGENT"]} />
              </div>
            </> : null}
            {draft.feature === "COMPETITOR" || draft.feature === "PARTNER" ? <div>
              <p className="eyebrow text-stone">Assessment</p>
              <dl className="mt-5 space-y-4 text-sm leading-6">
                {Object.entries(output).map(([key, value]) => <div key={key} className="grid gap-1 border-b border-line pb-4 sm:grid-cols-3"><dt className="text-stone">{key}</dt><dd className="sm:col-span-2">{Array.isArray(value) ? value.join(" · ") : String(value ?? "")}</dd></div>)}
              </dl>
            </div> : null}
            <Submit>{draft.feature === "ASK_CHINA" ? "Publish answer" : "Approve and publish"}</Submit>
          </form>
          <form action={discardIntelligenceDraft} className="mt-5">
            <input type="hidden" name="id" value={draft.id} />
            <button className="text-xs text-stone underline decoration-ink/20 underline-offset-4">Discard draft</button>
          </form>
        </div>
      </div>
    </article>
  );
}

function Generator({ kind, organizations }: { kind: "research" | "market"; organizations: Array<{ id: string; name: string }> }) {
  const action = kind === "research" ? generateResearchDraft : generateMarketDraft;
  return <details className="border-t border-line py-6">
    <summary className="cursor-pointer list-none text-lg font-medium">Draft {kind === "research" ? "research" : "a Market Pulse update"} →</summary>
    <form action={action} className="mt-8 grid gap-6 md:grid-cols-2">
      {kind === "research" ? <OrganizationField organizations={organizations} /> : <fieldset><legend className="eyebrow text-stone">Publish to clients</legend><div className="mt-3 space-y-2">{organizations.map((organization) => <label key={organization.id} className="flex items-center gap-3 text-sm"><input type="checkbox" name="organization_ids" value={organization.id} />{organization.name}</label>)}</div></fieldset>}
      <label className="block"><span className="eyebrow text-stone">Source document</span><input type="file" name="attachment" accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json" className="mt-3 block w-full border-b border-ink/20 pb-3 text-sm file:mr-4 file:border-0 file:bg-transparent file:text-sm" /></label>
      <div className="md:col-span-2"><Textarea label="Source material" name="material" rows={9} /></div>
      <div className="md:col-span-2"><Textarea label="Source URL (reference only)" name="source_url" rows={2} /></div>
      <Submit>Generate review draft</Submit>
    </form>
  </details>;
}

export default async function IntelligencePage() {
  await requireAdmin();
  const supabase = await createClient();
  const organizations = await getOrganizations();
  const [draftsResult, questionsResult, lowConfidenceResult, usageResult, recentQuestionsResult, gapsResult, handoffsResult] = await Promise.all([
    supabase.from("ai_drafts").select("id,organization_id,feature,output,source_material,created_at,organizations(name)").eq("status", "DRAFT").order("created_at", { ascending: true }),
    supabase.from("ai_messages").select("id", { count: "exact", head: true }).eq("role", "USER"),
    supabase.from("ai_messages").select("id", { count: "exact", head: true }).eq("role", "ASSISTANT").eq("confidence", "LOW"),
    supabase.from("ai_usage").select("total_tokens"),
    supabase.from("ai_messages").select("id,content,created_at,organizations(name)").eq("role", "USER").order("created_at", { ascending: false }).limit(100),
    supabase.from("ai_messages").select("id,content,created_at,organizations(name)").eq("role", "ASSISTANT").eq("confidence", "LOW").order("created_at", { ascending: false }).limit(8),
    supabase.from("requests").select("id,title,status,created_at,organizations(name)").or("description.ilike.Created from Ask Meridian.%,description.ilike.Created from Ask China.%").order("created_at", { ascending: false }).limit(8),
  ]);
  if (draftsResult.error) throw new Error(draftsResult.error.message);
  const drafts = (draftsResult.data || []) as Draft[];
  const recentQuestions = (recentQuestionsResult.data || []) as ClientQuestion[];
  const topics = frequentTopics(recentQuestions);
  const tokens = (usageResult.data || []).reduce((sum, item) => sum + Number(item.total_tokens || 0), 0);

  return <>
    <PageHeader eyebrow="INTELLIGENCE" title="Human judgment, kept in the loop." description="Review client answers and turn source material into publishable Meridian intelligence." />
    <div className="grid border-y border-line sm:grid-cols-2 xl:grid-cols-4">
      {[["QUESTIONS", questionsResult.count || 0], ["AWAITING REVIEW", drafts.length], ["LOW CONFIDENCE", lowConfidenceResult.count || 0], ["TOKENS USED", tokens]].map(([label, value]) => <div key={label} className="border-b border-line py-7 sm:px-5 sm:first:pl-0 xl:border-b-0 xl:border-r xl:last:border-r-0"><p className="eyebrow text-stone">{label}</p><p className="mt-5 text-4xl font-medium tracking-[-0.06em]">{Number(value).toLocaleString()}</p></div>)}
    </div>
    <section className="mt-20">
      <h2 className="pb-5 text-2xl font-medium">Review queue</h2>
      {drafts.length ? drafts.map((draft) => <DraftEditor key={draft.id} draft={draft} />) : <EmptyState title="The review queue is clear." description="Draft client answers and intelligence will appear here before publication." />}
    </section>
    <section className="mt-24">
      <p className="eyebrow text-stone">ASSISTANTS</p>
      <h2 className="mt-5 max-w-2xl text-4xl font-medium tracking-[-0.055em]">Start from evidence. Publish only after review.</h2>
      <div className="mt-10"><Generator kind="research" organizations={organizations} /><Generator kind="market" organizations={organizations} /></div>
    </section>
    <section className="mt-24 grid gap-16 xl:grid-cols-2">
      <div>
        <p className="eyebrow text-stone">RECENT CLIENT QUESTIONS</p>
        {topics.length ? <p className="mt-4 text-xs leading-5 text-stone">Frequent language: {topics.join(" · ")}</p> : null}
        <div className="mt-5 border-t border-line">{recentQuestions.slice(0, 12).map((item) => { const org = Array.isArray(item.organizations) ? item.organizations[0] : item.organizations; return <article key={item.id} className="border-b border-line py-5"><p className="leading-6">{item.content}</p><p className="mt-3 text-xs text-stone">{org?.name || "Client"} · {formatDate(item.created_at)}</p></article>; })}</div>
      </div>
      <div>
        <p className="eyebrow text-stone">RESEARCH GAPS</p>
        <div className="mt-5 border-t border-line">{((gapsResult.data || []) as ClientQuestion[]).map((item) => { const org = Array.isArray(item.organizations) ? item.organizations[0] : item.organizations; return <article key={item.id} className="border-b border-line py-5"><p className="leading-6">{item.content}</p><p className="mt-3 text-xs text-stone">Low confidence · {org?.name || "Client"}</p></article>; })}</div>
      </div>
    </section>
    <section className="mt-24">
      <p className="eyebrow text-stone">ASK MERIDIAN HANDOFFS</p>
      <div className="mt-5 border-t border-line">{(handoffsResult.data || []).map((item) => { const orgValue = item.organizations as { name: string } | { name: string }[] | null; const org = Array.isArray(orgValue) ? orgValue[0] : orgValue; return <article key={item.id} className="grid gap-2 border-b border-line py-5 sm:grid-cols-12"><p className="sm:col-span-7">{item.title}</p><p className="text-xs text-stone sm:col-span-3">{org?.name || "Client"}</p><div className="sm:col-span-2"><Status>{item.status}</Status></div></article>; })}</div>
    </section>
  </>;
}
