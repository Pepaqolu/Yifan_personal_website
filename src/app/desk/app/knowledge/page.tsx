import { EmptyState, PageHeader } from "@/components/china-desk-app/ui";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { knowledgeCategories } from "@/lib/china-desk/constants";
import { getKnowledgeItems } from "@/lib/china-desk/data";
import { saveCompanyContext } from "./actions";

const profileFields = [
  ["company_overview", "Company overview"], ["products", "Products"],
  ["target_customers", "Target customers"], ["target_geography", "Target geography"],
  ["china_objectives", "China objectives"], ["pricing", "Pricing"],
  ["business_model", "Business model"], ["existing_partners", "Existing partners"],
  ["known_competitors", "Known competitors"], ["market_assumptions", "Market assumptions"],
  ["commercial_constraints", "Commercial constraints"], ["important_decisions", "Important decisions"],
] as const;

export default async function KnowledgePage() { const context=await requireWorkspace(); const items=await getKnowledgeItems(context.organization!.id); return <><PageHeader eyebrow="KNOWLEDGE" title="Context that compounds." description="The company, market, and decision context China Desk carries forward instead of starting from zero." /><details className="mb-16 border-y border-line py-6"><summary className="cursor-pointer list-none text-lg font-medium">Maintain company context →</summary><form action={saveCompanyContext} className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">{profileFields.map(([name,title])=>{const existing=items.find(item=>item.title===title&&item.tags.includes("company-profile"));return <label key={name} className="block"><span className="eyebrow text-stone">{title}</span><textarea name={name} rows={3} defaultValue={existing?.content||""} className="mt-3 w-full resize-y border-b border-ink/20 bg-transparent pb-3 text-sm leading-6 outline-none"/></label>})}<button className="w-fit border-b border-ink/25 pb-1.5 text-sm font-medium">Save company context →</button></form></details>{items.length ? <div className="grid border-t border-line md:grid-cols-2">{knowledgeCategories.map(category=>{const grouped=items.filter(item=>item.category===category); if(!grouped.length)return null; return <section key={category} className="border-b border-line py-8 md:px-8 md:odd:border-r md:odd:pl-0"><h2 className="eyebrow text-stone">{category}</h2>{grouped.map(item=><article key={item.id} className="mt-6"><h3 className="text-xl font-medium">{item.title}</h3><p className="mt-3 text-sm leading-6 text-stone">{item.content}</p>{item.tags.length?<p className="mt-3 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-stone">{item.tags.join(" · ")}</p>:null}</article>)}</section>})}</div> : <EmptyState title="No context captured yet." description="Add the company profile above; decisions and accumulated knowledge will gather here." />}</>; }
