import Link from "next/link";
import { PageHeader, Status, formatDate } from "@/components/china-desk-app/ui";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { createClient } from "@/lib/supabase/server";
import { getTokenBalance } from "@/lib/tokens/service";

const eventLabels:Record<string,string>={PROMO_GRANT:"Beta Tokens added",PURCHASE_GRANT:"Purchased Tokens added",RESEARCH_RESERVE:"Research reserved",RESEARCH_SETTLE:"Research completed",RESEARCH_REFUND:"Tokens returned",PROMO_EXPIRE:"Promotional Tokens expired",ADMIN_ADJUSTMENT:"Balance adjustment",REVERSAL:"Reversal"};

export default async function TokensPage(){
  const context=await requireWorkspace();const organizationId=context.organization!.id;const supabase=await createClient();
  const [balance,ledgerResult,lotsResult]=await Promise.all([
    getTokenBalance(),
    supabase.from("token_ledger").select("id,event_type,token_delta,reserved_delta,reason,created_at,research_job_id").eq("organization_id",organizationId).order("created_at",{ascending:false}).limit(100),
    supabase.from("token_lots").select("id,kind,available_tokens,reserved_tokens,expires_at,source_type").eq("organization_id",organizationId).order("created_at",{ascending:false}),
  ]);
  const ledger=ledgerResult.data||[],lots=lotsResult.data||[];
  return <><PageHeader eyebrow="ACCOUNT · TOKENS" title={`${balance?.available_tokens??0} Tokens available.`} description="One Meridian Token represents $1 of research value. Tokens are reserved when research begins and only settled when a usable result is completed." action={<Link href="/meridian/app/product" className="text-sm text-accent">Start research →</Link>}/>
    <section className="grid border-y border-line md:grid-cols-4">{[["AVAILABLE",balance?.available_tokens??0],["PROMOTIONAL",balance?.promotional_tokens??0],["PURCHASED",balance?.purchased_tokens??0],["RESERVED",balance?.reserved_tokens??0]].map(([label,value])=><div key={label} className="border-b border-line py-7 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0"><p className="eyebrow text-stone">{label}</p><p className="mt-4 text-4xl font-medium tracking-[-0.06em]">{value}</p></div>)}</section>
    {balance?.next_promo_expiry?<p className="mt-6 text-sm text-charcoal">Promotional Tokens expire {formatDate(balance.next_promo_expiry)}. They are always used before purchased Tokens.</p>:null}
    <section className="mt-20"><div className="flex items-end justify-between border-b border-line pb-5"><div><p className="eyebrow text-stone">ACTIVITY</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.05em]">Token history.</h2></div><span className="text-xs text-stone">Organization wallet</span></div>{ledger.length?ledger.map((entry)=><article key={entry.id} className="grid gap-3 border-b border-line py-6 md:grid-cols-12 md:items-center"><div className="md:col-span-5"><p className="font-medium">{eventLabels[entry.event_type]||entry.event_type}</p><p className="mt-1 text-xs text-stone">{entry.reason||"Meridian research activity"}</p></div><div className="md:col-span-2"><Status>{entry.event_type.replaceAll("_"," ")}</Status></div><p className={`font-mono text-sm md:col-span-2 ${entry.token_delta>0?"text-jade":entry.token_delta<0?"text-ink":"text-stone"}`}>{entry.token_delta>0?"+":""}{entry.token_delta} Tokens</p><p className="text-xs text-stone md:col-span-3 md:text-right">{formatDate(entry.created_at)}</p></article>):<div className="py-14"><p className="text-lg">No Token activity yet.</p><p className="mt-3 max-w-lg text-sm leading-6 text-charcoal">Your balance and research reservations will appear here when an administrator activates your beta allocation.</p></div>}</section>
    {lots.some((lot)=>lot.reserved_tokens>0)?<p className="mt-8 text-xs leading-5 text-stone">Reserved Tokens are protected while a research job is running. Technical failures return eligible Tokens automatically.</p>:null}
  </>;
}
