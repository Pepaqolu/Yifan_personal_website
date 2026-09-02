import Link from "next/link";
import { PageHeader, formatDate } from "@/components/china-desk-app/ui";
import { requireAdmin } from "@/lib/china-desk/auth";
import { getAdminOverview } from "@/lib/china-desk/data";

export default async function AdminPage(){
  await requireAdmin();
  const data=await getAdminOverview();
  const metrics=[["ANALYSES",data.analyses],["ACTIVE TRIALS",data.trials],["TRIALS EXPIRING",data.trialsExpiring],["ANALYSIS → TRIAL",data.conversions],["VERIFICATION JOBS",data.verifications],["ACTIVE CLIENTS",data.clients]] as const;
  return <><PageHeader eyebrow="MERIDIAN · ADMIN" title="The operating layer." description="Acquisition, trials, client work and verification—kept visible without rebuilding the functioning admin system."/>
    <div className="grid overflow-hidden rounded-2xl border border-line bg-elevated sm:grid-cols-2 xl:grid-cols-6">{metrics.map(([label,value])=><div key={label} className="border-b border-line p-5 sm:border-r xl:border-b-0 xl:last:border-r-0"><p className="eyebrow text-stone">{label}</p><p className="mt-5 text-4xl font-medium tracking-[-0.065em]">{value}</p></div>)}</div>
    <div className="mt-20 grid gap-16 xl:grid-cols-12"><section className="xl:col-span-7"><div className="flex items-center justify-between border-b border-line pb-5"><h2 className="text-2xl font-medium">New analyses</h2><span className="text-xs text-stone">Anonymous and converted</span></div>{data.recentAnalyses.length?data.recentAnalyses.map((item)=><article key={item.id} className="grid gap-2 border-b border-line py-6 md:grid-cols-12"><div className="md:col-span-6"><p className="font-medium">{item.company_name||item.company_website||"Unnamed analysis"}</p><p className="mt-2 text-xs text-stone">{item.claimed_by?"Converted to trial":"Anonymous snapshot"}</p></div><p className="text-sm text-charcoal md:col-span-3">{item.status}</p><p className="text-xs text-stone md:col-span-3 md:text-right">{formatDate(item.created_at)}</p></article>):<p className="py-10 text-stone">New analyses will appear here.</p>}</section>
    <section className="xl:col-span-4 xl:col-start-9"><div className="flex items-center justify-between border-b border-line pb-5"><h2 className="text-2xl font-medium">Recent activity</h2><Link href="/admin/clients" className="text-xs text-stone">Clients →</Link></div>{data.activity.length?data.activity.map((item)=>{const org=Array.isArray(item.organizations)?item.organizations[0]:item.organizations;return <article key={item.id} className="border-b border-line py-5"><p className="text-sm">{item.action}</p><p className="mt-2 text-xs text-stone">{org?.name||"Client"} · {formatDate(item.created_at)}</p></article>}):<p className="py-10 text-stone">Activity will appear here.</p>}</section></div>
  </>;
}
