"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { FormEvent, useEffect, useState } from "react";
import { chinaDeskDemo as demo, type Competitor, type PartnerStatus } from "@/data/china-desk-demo";
import { AnalyticsLink } from "./analytics-link";

const navItems = ["Overview", "Market Pulse", "Competitors", "Partners", "Research", "Requests", "Knowledge"] as const;
type View = (typeof navItems)[number];
const navGroups: Array<{ label?: string; items: View[] }> = [
  { items: ["Overview"] },
  { label: "INTELLIGENCE", items: ["Market Pulse", "Competitors", "Partners"] },
  { label: "WORK", items: ["Research", "Requests"] },
  { label: "CONTEXT", items: ["Knowledge"] },
];

function DemoBadge() {
  return <span className="inline-flex rounded-md border border-line bg-white/[0.025] px-2 py-1 font-mono text-[0.54rem] uppercase tracking-[0.12em] text-stone">Demo data</span>;
}

function SectionHeading({ label, title, description }: { label: string; title: string; description?: string }) {
  return (
    <header className="mb-10 border-b border-line pb-7 sm:mb-12">
      <div className="flex items-center justify-between gap-4"><p className="eyebrow text-stone">{label}</p><DemoBadge /></div>
      <h1 className="mt-5 text-[clamp(2.5rem,5vw,4.75rem)] font-medium leading-[0.92] tracking-[-0.062em]">{title}</h1>
      {description ? <p className="mt-6 max-w-2xl text-base leading-[1.6] text-stone sm:text-lg">{description}</p> : null}
    </header>
  );
}

function AskChina() {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); if (question.trim()) setSubmitted(true); };

  return (
    <section className="mt-16 border-t border-line pt-10">
      <p className="eyebrow text-stone">ASK CHINA</p>
      <form onSubmit={submit} className="mt-6 rounded-[20px] border border-line bg-elevated p-5 shadow-[var(--shadow-elevated)] sm:p-7">
        <label htmlFor="ask-china" className="sr-only">Ask your China Desk anything</label>
        <div className="flex items-end gap-4">
          <textarea id="ask-china" value={question} onChange={(event) => { setQuestion(event.target.value); setSubmitted(false); }} rows={2} placeholder="Ask your China Desk anything..." className="command-input min-w-0 flex-1 resize-none text-[clamp(1.6rem,3vw,3rem)] font-medium leading-[1.1] tracking-[-0.05em] outline-none placeholder:text-stone/45" />
          <button type="submit" className="shrink-0 rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-[#071018] transition-colors hover:bg-ice-bright">Ask →</button>
        </div>
      </form>
      {submitted ? (
        <div className="mt-8 max-w-xl border-l border-accent pl-5">
          <p className="font-medium">China Desk AI is currently in private development.</p>
          <AnalyticsLink eventName="Email clicked" eventLocation="desk-demo-question" href={`mailto:yifanevanfu@gmail.com?subject=China%20Desk%20Question&body=${encodeURIComponent(question)}`} className="mt-3 inline-block text-sm text-stone hover:text-accent">Send this question to Yifan →</AnalyticsLink>
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
          {demo.suggestedQueries.map((query) => <button key={query} onClick={() => setQuestion(query)} className="text-left text-xs leading-[1.5] text-stone transition-colors hover:text-ink sm:text-sm">{query}</button>)}
        </div>
      )}
    </section>
  );
}

function Overview() {
  return (
    <>
      <SectionHeading label="OVERVIEW" title="Good morning." description={`${demo.client.name} · ${demo.client.desk}`} />
      <div className="grid overflow-hidden rounded-2xl border border-line bg-elevated sm:grid-cols-2 xl:grid-cols-5">
        {demo.metrics.map((metric) => (
          <div key={metric.label} className="border-b border-line p-6 sm:border-r xl:border-b-0 xl:last:border-r-0">
            <p className="eyebrow text-stone">{metric.label}</p>
            <p className="mt-6 text-4xl font-medium tracking-[-0.065em]">{metric.value}</p>
            <p className="mt-3 max-w-[18rem] text-xs leading-[1.5] text-stone">{metric.detail}</p>
          </div>
        ))}
      </div>
      <AskChina />
      <section className="mt-20">
        <div className="flex items-end justify-between border-b border-line pb-5"><h2 className="text-2xl font-medium tracking-[-0.045em]">Latest market pulse</h2><span className="text-xs text-stone">3 developments</span></div>
        {demo.marketUpdates.map((update) => <MarketUpdateRow key={update.headline} update={update} />)}
      </section>
    </>
  );
}

function MarketUpdateRow({ update }: { update: (typeof demo.marketUpdates)[number] }) {
  return (
    <article className="grid gap-4 border-b border-line py-7 transition-colors hover:bg-white/[0.018] md:grid-cols-12 md:gap-6 md:px-4">
      <div className="flex gap-4 md:col-span-2 md:block"><p className="font-mono text-[0.62rem] tracking-[0.1em] text-stone">{update.date}</p><p className="mt-0 text-xs text-accent md:mt-3">{update.category}</p></div>
      <div className="md:col-span-7"><h3 className="text-xl font-medium leading-[1.15] tracking-[-0.035em] sm:text-2xl">{update.headline}</h3><p className="mt-3 max-w-2xl text-sm leading-[1.6] text-stone">{update.explanation}</p></div>
      <p className="text-xs leading-[1.5] text-stone/70 md:col-span-3 md:self-end">{update.sourceType}</p>
    </article>
  );
}

function MarketPulse() {
  return <><SectionHeading label="MARKET PULSE" title="What changed." description="A focused feed of developments relevant to this demo market context." />{demo.marketUpdates.map((update) => <MarketUpdateRow key={update.headline} update={update} />)}</>;
}

function Competitors({ onSelect }: { onSelect: (competitor: Competitor) => void }) {
  return (
    <><SectionHeading label="COMPETITOR RADAR" title="The market in motion." description="A restrained watchlist of example competitor activity. All records are demo data." />
      <div className="border-t border-line">
        <div className="hidden grid-cols-12 gap-5 border-b border-line py-4 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-stone md:grid"><span className="col-span-3">Company</span><span className="col-span-2">Segment</span><span className="col-span-4">Latest activity</span><span>Priority</span><span className="col-span-2">Updated</span></div>
        {demo.competitors.map((competitor) => <button key={competitor.id} onClick={() => onSelect(competitor)} className="grid w-full gap-3 border-b border-line py-6 text-left transition-colors hover:text-accent md:grid-cols-12 md:items-baseline md:gap-5"><span className="text-xl font-medium tracking-[-0.035em] md:col-span-3">{competitor.company}</span><span className="text-sm text-stone md:col-span-2">{competitor.segment}</span><span className="text-sm md:col-span-4">{competitor.latestActivity}</span><span className="text-xs text-stone">{competitor.priority}</span><span className="text-xs text-stone md:col-span-2">{competitor.lastUpdated}</span></button>)}
      </div>
    </>
  );
}

function Partners() {
  const statuses: PartnerStatus[] = ["Identified", "Qualified", "Contacted", "Interested", "Active"];
  return (
    <><SectionHeading label="PARTNER RADAR" title="Relationships, organized." description="An illustrative China-market relationship workspace rather than a generic sales pipeline." />
      <div className="grid gap-10 lg:grid-cols-5 lg:gap-4">
        {statuses.map((status) => <section key={status} className="rounded-2xl border border-line bg-elevated p-4"><div className="flex justify-between border-b border-line pb-3"><h2 className="text-sm font-medium">{status}</h2><span className="text-xs text-stone">{demo.partners.filter((partner) => partner.status === status).length}</span></div>{demo.partners.filter((partner) => partner.status === status).map((partner) => <article key={partner.company} className="border-b border-line py-5 last:border-0"><h3 className="font-medium tracking-[-0.025em]">{partner.company}</h3><p className="mt-2 text-xs text-stone">{partner.type} · {partner.location}</p><p className="mt-4 text-xs leading-[1.55] text-charcoal">{partner.notes}</p><p className="mt-3 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-stone">{partner.contact}</p></article>)}</section>)}
      </div>
    </>
  );
}

function Research() {
  return <><SectionHeading label="RESEARCH" title="A working library." description="Research stays connected to the questions, conversations and decisions around it." /><div className="border-t border-line">{demo.research.map((item) => <article key={item.title} className="grid gap-3 border-b border-line py-7 md:grid-cols-12 md:items-baseline md:gap-6"><h2 className="text-xl font-medium tracking-[-0.035em] md:col-span-4">{item.title}</h2><p className="text-sm leading-[1.6] text-stone md:col-span-5">{item.description}</p><span className="text-xs text-stone md:col-span-2">{item.status}</span><span className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-stone">{item.date}</span></article>)}</div></>;
}

function Requests({ onRequest }: { onRequest: (type: string) => void }) {
  return <><SectionHeading label="REQUESTS" title="Ask for real work." description="See how a China-side request could move from a question to research, outreach or execution." /><div className="border-t border-line">{demo.requestTypes.map((type, index) => <button key={type} onClick={() => onRequest(type)} className="flex w-full items-center justify-between border-b border-line py-6 text-left group"><span><span className="mr-6 font-mono text-[0.6rem] text-stone">{String(index + 1).padStart(2, "0")}</span><span className="text-xl font-medium tracking-[-0.035em] sm:text-2xl">{type}</span></span><span className="text-accent transition-transform group-hover:translate-x-1">→</span></button>)}</div></>;
}

function Knowledge() {
  return <><SectionHeading label="KNOWLEDGE" title="Context that compounds." description="A visual representation of the institutional knowledge a long-running China Desk can accumulate." /><div className="grid border-t border-line md:grid-cols-2">{demo.knowledge.map((area) => <section key={area.title} className="border-b border-line py-8 md:px-8 md:odd:border-r md:odd:pl-0"><p className="eyebrow text-stone">{area.title}</p><p className="mt-6 text-lg leading-[1.55] tracking-[-0.03em]">{area.items.map((item) => <span key={item} className="block">{item}</span>)}</p></section>)}</div></>;
}

function CompetitorPanel({ competitor, onClose }: { competitor: Competitor; onClose: () => void }) {
  return <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" onClick={onClose}><aside aria-label={`${competitor.company} details`} className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-line bg-elevated p-6 shadow-[var(--shadow-elevated)] sm:p-10" onClick={(event) => event.stopPropagation()}><div className="flex justify-between"><DemoBadge /><button onClick={onClose} className="text-sm text-stone hover:text-ink">Close</button></div><h2 className="mt-12 text-4xl font-medium tracking-[-0.06em] sm:text-5xl">{competitor.company}</h2><p className="mt-4 text-stone">{competitor.overview}</p>{[["Products",competitor.products],["Positioning",[competitor.positioning]],["Recent activity",[competitor.latestActivity]],["Notes",[competitor.notes]],["Sources",competitor.sources]].map(([label,items]) => <section key={label as string} className="mt-10 border-t border-line pt-5"><p className="eyebrow text-stone">{label as string}</p><p className="mt-4 leading-[1.6]">{(items as readonly string[]).map((item)=><span key={item} className="block">{item}</span>)}</p></section>)}</aside></div>;
}

function RequestModal({ type, onClose }: { type: string; onClose: () => void }) {
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="request-title" className="w-full max-w-lg rounded-[20px] border border-line bg-elevated p-7 shadow-[var(--shadow-elevated)] sm:p-10" onClick={(event)=>event.stopPropagation()}><div className="flex justify-between"><DemoBadge /><button onClick={onClose} className="text-sm text-stone">Close</button></div><h2 id="request-title" className="mt-10 text-4xl font-medium tracking-[-0.06em]">{type}</h2><p className="mt-5 leading-[1.65] text-stone">Backend requests are not enabled in this demo. Send the request directly to Yifan instead.</p><AnalyticsLink eventName="Email clicked" eventLocation="desk-demo-request" href={`mailto:yifanevanfu@gmail.com?subject=${encodeURIComponent(`China Desk Request: ${type}`)}`} className="mt-10 inline-block border-b border-ink/25 pb-1 text-sm font-medium hover:border-accent">Email Yifan →</AnalyticsLink></section></div>;
}

export function DeskDemo() {
  const [view, setView] = useState<View>("Overview");
  const [competitor, setCompetitor] = useState<Competitor | null>(null);
  const [requestType, setRequestType] = useState<string | null>(null);

  useEffect(() => { track("Dashboard demo viewed", { location: "desk-demo" }); }, []);

  const content = view === "Overview" ? <Overview /> : view === "Market Pulse" ? <MarketPulse /> : view === "Competitors" ? <Competitors onSelect={setCompetitor} /> : view === "Partners" ? <Partners /> : view === "Research" ? <Research /> : view === "Requests" ? <Requests onRequest={setRequestType} /> : <Knowledge />;

  return (
    <div className="demo-shell min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-line bg-dark-soft px-6 py-7 lg:flex lg:flex-col">
        <div className="border-b border-line pb-6"><Link href="/desk" className="flex items-center gap-3 text-[0.72rem] font-semibold tracking-[0.08em]"><span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_rgba(158,215,255,0.28)]"/>CHINA DESK</Link><div className="mt-4"><DemoBadge /></div></div>
        <nav aria-label="Dashboard" className="mt-5 overflow-y-auto">{navGroups.map((group)=><div key={group.label||"overview"}>{group.label?<p className="pb-2 pt-7 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-stone">{group.label}</p>:null}<ul className="space-y-1">{group.items.map((item) => <li key={item}><button onClick={() => setView(item)} className={`relative w-full rounded-[9px] px-3 py-2.5 text-left text-[0.82rem] transition-[color,background-color] ${view === item ? "bg-accent/[0.08] font-medium text-accent before:absolute before:inset-y-2.5 before:left-0 before:w-px before:bg-accent" : "text-charcoal hover:bg-white/[0.025] hover:text-ink"}`}>{item}</button></li>)}</ul></div>)}</nav>
        <div className="mt-auto border-t border-line pt-5"><div className="flex items-start gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent"/><div><p className="text-sm font-medium">YIFAN FU</p><p className="mt-1 text-xs text-stone">China ↔ World</p></div></div></div>
      </aside>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/[0.78] px-5 py-4 backdrop-blur-2xl backdrop-saturate-150 lg:hidden"><div className="flex items-center justify-between"><Link href="/desk" className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.08em]"><span className="h-1.5 w-1.5 rounded-full bg-accent"/>CHINA DESK</Link><DemoBadge /></div><label htmlFor="demo-view" className="sr-only">Dashboard section</label><select id="demo-view" value={view} onChange={(event)=>setView(event.target.value as View)} className="mt-4 w-full appearance-none text-sm font-medium outline-none">{navItems.map((item)=><option key={item}>{item}</option>)}</select></header>
      <main className="min-h-screen bg-[radial-gradient(circle_at_60%_0%,rgba(158,215,255,0.025),transparent_26%)] px-5 py-8 sm:px-8 sm:py-12 lg:ml-72 lg:px-12 xl:px-16"><div className="mx-auto max-w-[92rem]">{content}</div></main>
      {competitor ? <CompetitorPanel competitor={competitor} onClose={() => setCompetitor(null)} /> : null}
      {requestType ? <RequestModal type={requestType} onClose={() => setRequestType(null)} /> : null}
    </div>
  );
}
