import Link from "next/link";
import { AnalysisProgress } from "@/components/china-desk-app/intelligence-ui";
import { ProductProfileWizard } from "@/components/china-desk-app/product-profile-wizard";
import { SearchTrace } from "@/components/china-desk-app/search-trace";
import { ResearchRetry } from "@/components/china-desk-app/research-retry";
import { PageHeader, Status } from "@/components/china-desk-app/ui";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { getProductIntelligence, getProductProfiles, getSearchTrace } from "@/lib/meridian-intelligence/data";
import { createClient } from "@/lib/supabase/server";
import { getTokenBalance } from "@/lib/tokens/service";

const intentLabels:Record<string,string>={
  DISTRIBUTOR:"Distributors",PARTNER:"Partners",CUSTOMER:"Customers",SUPPLIER:"Suppliers",
  COMPETITOR:"Competitors",REGULATORY:"Regulation",TENDER:"Tenders",PRICING:"Pricing",
  COMPANY:"Company activity",MARKET:"Market signals",
};

export default async function ProductPage({searchParams}:{searchParams:Promise<{id?:string;website?:string;research?:string;tokens?:string}>}){
  const context=await requireWorkspace();
  const profiles=await getProductProfiles(context.organization!.id);
  const params=await searchParams;
  const selected=profiles.find((item)=>item.id===params.id)||profiles[0]||null;
  const [intelligence,trace,balance]=await Promise.all([selected?getProductIntelligence(context.organization!.id,selected.id):null,selected?getSearchTrace(context.organization!.id,selected.id):[],getTokenBalance()]);
  const supabase=await createClient();
  const progress=selected?(await supabase.from("analysis_progress").select("stage,status,completed_stages,error_message,updated_at").eq("organization_id",context.organization!.id).eq("product_id",selected.id).order("updated_at",{ascending:false}).limit(1).maybeSingle()).data:null;
  const categories=[...new Set((intelligence?.queries||[]).map((query)=>intentLabels[query.intent.toUpperCase()]||query.intent.replaceAll("_"," ")))].slice(0,9);

  return <>
    <PageHeader eyebrow="PRODUCT PROFILE" title="Tell Meridian what matters." description="A short product brief becomes a China-specific search strategy. Meridian generates the technical detail; you stay in control." action={selected?<Link href="/meridian/app/partners" className="text-xs text-stone hover:text-accent">View opportunities →</Link>:undefined}/>
    {profiles.length>1?<nav className="mb-12 flex flex-wrap gap-4" aria-label="Products">{profiles.map((profile)=><Link key={profile.id} href={`/meridian/app/product?id=${profile.id}`} className={`text-sm ${profile.id===selected?.id?"text-accent":"text-stone"}`}>{profile.product_name}</Link>)}</nav>:null}

    {params.research==="complete"?<p role="status" className="mb-8 max-w-5xl rounded-xl border border-jade/30 bg-jade/[0.07] p-5 text-sm text-jade">RESEARCH COMPLETE · {Number(params.tokens)||0} Tokens used · Balance {balance?.available_tokens??0} Tokens</p>:null}
    <ProductProfileWizard initial={selected} initialUrl={(params.website||"").slice(0,500)} tokenBalance={balance?.available_tokens??0}/>

    {progress?<section className="mt-20 max-w-5xl"><AnalysisProgress stage={progress.stage} status={progress.status} completedStages={progress.completed_stages||[]} error={progress.error_message}/>{progress.status==="FAILED"&&selected?<ResearchRetry productId={selected.id}/>:null}</section>:null}

    {selected?<section className="mt-28 max-w-5xl border-t border-line pt-10">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow text-stone">SEARCH STRATEGY READY</p><h2 className="mt-4 text-3xl font-medium tracking-[-0.05em]">{intelligence?.queries.length||0} searches prepared.</h2><p className="mt-3 text-sm text-charcoal">Meridian translated your objective into a traceable China search plan.</p></div><Status>{selected.industry||"Universal"}</Status></div>
      {categories.length?<div className="mt-9 flex flex-wrap gap-x-7 gap-y-4">{categories.map((category)=><span key={category} className="text-sm text-ink">{category}</span>)}</div>:<p className="mt-7 text-sm text-stone">Complete the profile to prepare your search strategy.</p>}
    </section>:null}
    {trace.length?<SearchTrace items={trace}/>:null}
  </>;
}
