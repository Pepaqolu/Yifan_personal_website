import Link from "next/link";
import { AnalysisProgress } from "@/components/china-desk-app/intelligence-ui";
import { ProductProfileWizard } from "@/components/china-desk-app/product-profile-wizard";
import { PageHeader, Status } from "@/components/china-desk-app/ui";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { getProductIntelligence, getProductProfiles } from "@/lib/meridian-intelligence/data";
import { createClient } from "@/lib/supabase/server";

const intentLabels:Record<string,string>={
  DISTRIBUTOR:"Distributors",PARTNER:"Partners",CUSTOMER:"Customers",SUPPLIER:"Suppliers",
  COMPETITOR:"Competitors",REGULATORY:"Regulation",TENDER:"Tenders",PRICING:"Pricing",
  COMPANY:"Company activity",MARKET:"Market signals",
};

export default async function ProductPage({searchParams}:{searchParams:Promise<{id?:string}>}){
  const context=await requireWorkspace();
  const profiles=await getProductProfiles(context.organization!.id);
  const params=await searchParams;
  const selected=profiles.find((item)=>item.id===params.id)||profiles[0]||null;
  const intelligence=selected?await getProductIntelligence(context.organization!.id,selected.id):null;
  const supabase=await createClient();
  const progress=selected?(await supabase.from("analysis_progress").select("stage,status,completed_stages,error_message,updated_at").eq("organization_id",context.organization!.id).eq("product_id",selected.id).order("updated_at",{ascending:false}).limit(1).maybeSingle()).data:null;
  const categories=[...new Set((intelligence?.queries||[]).map((query)=>intentLabels[query.intent.toUpperCase()]||query.intent.replaceAll("_"," ")))].slice(0,9);

  return <>
    <PageHeader eyebrow="PRODUCT PROFILE" title="Tell Meridian what matters." description="A short product brief becomes a China-specific search strategy. Meridian generates the technical detail; you stay in control." action={selected?<Link href="/meridian/app/partners" className="text-xs text-stone hover:text-accent">View opportunities →</Link>:undefined}/>
    {profiles.length>1?<nav className="mb-12 flex flex-wrap gap-4" aria-label="Products">{profiles.map((profile)=><Link key={profile.id} href={`/meridian/app/product?id=${profile.id}`} className={`text-sm ${profile.id===selected?.id?"text-accent":"text-stone"}`}>{profile.product_name}</Link>)}</nav>:null}

    <ProductProfileWizard initial={selected}/>

    {progress?<section className="mt-20 max-w-5xl"><AnalysisProgress stage={progress.stage} status={progress.status} completedStages={progress.completed_stages||[]} error={progress.error_message}/></section>:null}

    {selected?<section className="mt-28 max-w-5xl border-t border-line pt-10">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow text-stone">SEARCH STRATEGY READY</p><h2 className="mt-4 text-3xl font-medium tracking-[-0.05em]">{intelligence?.queries.length||0} searches prepared.</h2><p className="mt-3 text-sm text-charcoal">Meridian translated your objective into a traceable China search plan.</p></div><Status>{selected.industry||"Universal"}</Status></div>
      {categories.length?<div className="mt-9 flex flex-wrap gap-x-7 gap-y-4">{categories.map((category)=><span key={category} className="text-sm text-ink">{category}</span>)}</div>:<p className="mt-7 text-sm text-stone">Complete the profile to prepare your search strategy.</p>}
      {intelligence?.queries.length?<details className="mt-10 border-t border-line pt-6"><summary className="cursor-pointer text-sm text-stone transition-colors hover:text-accent">View technical search details →</summary><div className="mt-6 border-t border-line">{intelligence.queries.map((query)=><article key={query.id} className="grid gap-4 border-b border-line py-6 md:grid-cols-12"><div className="md:col-span-3"><Status>{intentLabels[query.intent.toUpperCase()]||query.intent}</Status><p className="mt-3 text-xs text-stone">Priority {query.priority}</p></div><div className="md:col-span-5"><p className="text-base leading-6">{query.query}</p><p className="mt-2 text-xs text-stone">{query.query_language}</p></div><p className="text-sm leading-6 text-charcoal md:col-span-4">{query.rationale}</p></article>)}</div></details>:null}
    </section>:null}
  </>;
}
