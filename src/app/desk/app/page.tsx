import Link from "next/link";
import { AttentionCard, BubbleCard, ConfidenceChip, ScoreChip } from "@/components/china-desk-app/intelligence-ui";
import { EmptyState, PageHeader } from "@/components/china-desk-app/ui";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { getMarketUpdates, getPartners } from "@/lib/china-desk/data";
import { getOpportunityAssessments } from "@/lib/meridian-intelligence/data";
import { createClient } from "@/lib/supabase/server";

export default async function OverviewPage(){
  const context=await requireWorkspace();const organizationId=context.organization!.id;const supabase=await createClient();
  const [partners,assessments,updates,attentionResult]=await Promise.all([
    getPartners(organizationId),getOpportunityAssessments(organizationId),getMarketUpdates(organizationId),
    supabase.from("conflict_records").select("id,conflict_type,stronger_evidence_summary,relevance_score,confidence_score,suggested_action,created_at").eq("organization_id",organizationId).gte("relevance_score",60).eq("status","OPEN").order("relevance_score",{ascending:false}).limit(4),
  ]);
  const assessmentMap=new Map(assessments.map((item)=>[item.opportunity_id,item]));
  const scored=partners.map((item)=>{const assessment=assessmentMap.get(item.id);const raw=assessment?.opportunity_score??item.fit_score;const score=typeof raw==="number"?raw:null;return{item,assessment,score};}).filter((entry)=>entry.score!==null&&entry.score>=60).sort((a,b)=>(b.score||0)-(a.score||0)).slice(0,4);
  const attention=attentionResult.data||[];const firstName=context.profile.first_name||"there";
  const nextActions=[...scored].filter((entry)=>entry.assessment?.recommended_next_action||entry.item.next_action).slice(0,3);
  return <>
    <PageHeader eyebrow="MERIDIAN · CHINA OPPORTUNITY INTELLIGENCE" title={`Good morning, ${firstName}.`} description="What matters in China right now—and what to do next." action={<Link href="/meridian/app/ask" className="text-sm font-medium text-accent">Ask Meridian →</Link>}/>

    <section><div className="flex items-end justify-between gap-5 border-b border-line pb-5"><div><p className="eyebrow text-accent">TOP OPPORTUNITIES</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.05em]">The strongest current fits.</h2></div><Link href="/meridian/app/partners" className="text-xs text-stone hover:text-accent">View top 10 →</Link></div>
      {scored.length?<div className="mt-6 grid gap-5 xl:grid-cols-2">{scored.map(({item,assessment,score})=><Link href={`/meridian/app/partners?opportunity=${item.id}`} key={item.id}><BubbleCard className="h-full p-6"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-stone">{item.partner_type}</p><h3 className="mt-3 text-2xl font-medium tracking-[-0.04em]">{item.company_name}</h3></div><ScoreChip score={score} label={assessment?.overall_assessment||"Qualified"}/></div><p className="mt-6 text-sm leading-6 text-charcoal">{assessment?.why_it_matters?.[0]||item.description||"Qualifying company identified from the current search strategy."}</p><div className="mt-6"><ConfidenceChip confidence={assessment?.confidence||"LOW"} score={assessment?.evidence_confidence_score??null}/></div></BubbleCard></Link>)}</div>:<div className="mt-6"><EmptyState title="No qualifying opportunities yet." description="Create a Product Profile so Meridian can search and score the market against your actual goals." action={<Link href="/meridian/app/product" className="text-sm font-medium text-accent">Create Product Profile →</Link>}/></div>}
    </section>

    <section className="mt-24"><p className="eyebrow text-coral">WORTH YOUR ATTENTION</p><h2 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.055em]">What you should know beyond the brief.</h2>{attention.length?<div className="mt-8 grid gap-5 lg:grid-cols-2">{attention.map((item)=><AttentionCard key={item.id} title={item.conflict_type.replaceAll("_"," ")} score={item.relevance_score} confidence={item.confidence_score} action={item.suggested_action||"Review the underlying evidence."}>{item.stronger_evidence_summary||"Conflicting evidence deserves a closer look."}</AttentionCard>)}</div>:<p className="mt-7 text-sm text-charcoal">Nothing outside your brief has crossed Meridian’s relevance threshold.</p>}</section>

    <div className="mt-24 grid gap-16 xl:grid-cols-12">
      <section className="xl:col-span-6"><div className="border-b border-line pb-5"><p className="eyebrow text-jade">RECOMMENDED NEXT ACTIONS</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.05em]">Move the strongest signals forward.</h2></div>{nextActions.length?<div>{nextActions.map(({item,assessment},index)=><Link key={item.id} href={`/meridian/app/partners?opportunity=${item.id}`} className="grid grid-cols-[2rem_1fr] gap-4 border-b border-line py-6"><span className="font-mono text-xs text-jade">0{index+1}</span><div><h3 className="font-medium">{item.company_name}</h3><p className="mt-2 text-sm leading-6 text-charcoal">{assessment?.recommended_next_action||item.next_action}</p></div></Link>)}</div>:<p className="py-7 text-sm text-charcoal">Next actions appear when an opportunity has enough evidence to act on.</p>}</section>
      <section className="xl:col-span-5 xl:col-start-8"><div className="flex justify-between border-b border-line pb-5"><div><p className="eyebrow text-accent">CONTEXTUAL INTELLIGENCE</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.05em]">Market signals.</h2></div><Link href="/meridian/app/market" className="text-xs text-stone">View all →</Link></div>{updates.slice(0,4).map((update)=><article key={update.id} className="border-b border-line py-6"><p className="eyebrow text-accent">{update.category}</p><h3 className="mt-3 text-lg font-medium tracking-[-0.03em]">{update.title}</h3><p className="mt-3 text-sm leading-6 text-charcoal">{update.summary}</p></article>)}{!updates.length?<p className="py-7 text-sm text-charcoal">Relevant market, competitor and regulatory signals will appear here.</p>:null}</section>
    </div>
  </>;
}
