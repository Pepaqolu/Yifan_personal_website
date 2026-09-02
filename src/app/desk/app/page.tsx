import Link from "next/link";
import { PageHeader, formatDate } from "@/components/china-desk-app/ui";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { getMarketUpdates, getOverview } from "@/lib/china-desk/data";

export default async function OverviewPage() {
  const context = await requireWorkspace();
  const organizationId = context.organization!.id;
  const [{ metrics, activity }, updates] = await Promise.all([getOverview(organizationId), getMarketUpdates(organizationId)]);
  const firstName = context.profile.first_name || "there";
  const cards = [
    ["MARKET SIGNALS", metrics.market, "relevant developments", "/meridian/app/market"],
    ["TOP COMPETITORS", metrics.competitors, `${metrics.competitorUpdates} updated this month`, "/meridian/app/competitors"],
    ["OPPORTUNITIES", metrics.opportunities, "customers, distributors and partners", "/meridian/app/partners"],
    ["PRIORITY OPPORTUNITIES", metrics.priorityOpportunities, "qualified or actively progressing", "/meridian/app/partners?view=pipeline"],
    ["OPEN ACTIONS", metrics.requestsOpen, "research or verification requests", "/meridian/app/requests"],
  ] as const;
  return <><PageHeader eyebrow="MERIDIAN · CHINA OPPORTUNITY MAP" title={context.organization!.name} description={`Good morning, ${firstName}. What opportunities exist for you in China right now?`} action={<Link href="/meridian/app/ask" className="group inline-flex items-center gap-3 text-sm font-medium"><span className="border-b border-ink/25 pb-1">Ask Meridian</span><span className="text-accent transition-transform group-hover:translate-x-1">→</span></Link>} />
    <div className="grid overflow-hidden rounded-2xl border border-line bg-elevated sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label,value,detail,href])=><Link key={label} href={href} className="border-b border-line p-6 transition-colors hover:bg-white/[0.025] sm:border-r lg:border-b-0 lg:last:border-r-0"><p className="eyebrow text-stone">{label}</p><p className="mt-6 text-4xl font-medium tracking-[-0.065em]">{value}</p><p className="mt-3 text-xs text-stone">{detail}</p></Link>)}</div>
    <div className="mt-20 grid gap-16 xl:grid-cols-12"><section className="xl:col-span-8"><div className="flex justify-between border-b border-line pb-5"><h2 className="text-2xl font-medium tracking-[-0.04em]">Latest market signals</h2><Link href="/meridian/app/market" className="text-xs text-stone">View all →</Link></div>{updates.slice(0,3).map(update=><article key={update.id} className="border-b border-line py-6"><p className="eyebrow text-accent">{update.category}</p><h3 className="mt-3 text-xl font-medium tracking-[-0.035em]">{update.title}</h3><p className="mt-3 text-sm leading-6 text-stone">{update.summary}</p></article>)}</section>
    <section className="xl:col-span-3 xl:col-start-10"><h2 className="border-b border-line pb-5 text-lg font-medium">Recent activity</h2>{activity.length ? activity.map(item=><article key={item.id} className="border-b border-line py-5"><p className="text-sm">{item.action}</p><p className="mt-2 text-xs text-stone">{formatDate(item.created_at)}</p></article>) : <p className="py-8 text-sm text-stone">Activity will appear as your desk moves.</p>}</section></div></>;
}
