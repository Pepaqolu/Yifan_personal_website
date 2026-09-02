import { AnalyticsLink } from "@/components/analytics-link";
import { Reveal } from "@/components/reveal";
import { productConfig } from "@/config/productConfig";
import { SourceIntelligenceFlow } from "@/components/source-intelligence-flow";

const opportunities = [
  { company: "Example East Healthcare", location: "Shanghai", type: "Distributor", score: 91, reason: "Hospital reach · imported device portfolio" },
  { company: "Example Clinical Group", location: "Guangzhou", type: "Customer network", score: 87, reason: "Specialty fit · active procurement signals" },
  { company: "Example North Medical", location: "Beijing", type: "Commercial partner", score: 82, reason: "Regional coverage · international readiness" },
] as const;

const pipeline = [
  ["Discovered", 37], ["Qualified", 12], ["Contacted", 6], ["Replied", 4], ["Interested", 3], ["Negotiating", 1], ["Active", 1],
] as const;

function DemoLabel() {
  return <span className="inline-flex rounded-md border border-accent/25 bg-accent/[0.08] px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-accent">Demo data</span>;
}

function OpportunityRows({ compact = false }: { compact?: boolean }) {
  return (
    <div className="border-t border-line">
      {opportunities.map((item, index) => (
        <article key={item.company} className="grid gap-3 border-b border-line py-5 sm:grid-cols-12 sm:items-center sm:gap-5">
          <span className="font-mono text-[0.62rem] text-stone sm:col-span-1">{String(index + 1).padStart(2, "0")}</span>
          <div className="sm:col-span-4"><h3 className="font-medium tracking-[-0.025em] sm:text-lg">{item.company}</h3><p className="mt-1 text-xs text-stone">{item.location} · {item.type}</p></div>
          {!compact ? <p className="text-sm leading-6 text-charcoal sm:col-span-5">{item.reason}</p> : <p className="text-xs text-charcoal sm:col-span-5">{item.reason}</p>}
          <div className="flex items-baseline gap-2 sm:col-span-2 sm:justify-end"><span className="text-2xl font-medium tracking-[-0.05em] text-accent">{item.score}</span><span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-stone">fit</span></div>
        </article>
      ))}
    </div>
  );
}

export function MeridianHome() {
  const name = productConfig.shortName.toUpperCase();
  return (
    <main>
      <section id="top" className="technical-grid relative overflow-hidden border-b border-line pt-32 sm:pt-40">
        <div className="page-shell grid gap-14 pb-16 lg:grid-cols-12 lg:items-center sm:pb-24">
          <div className="lg:col-span-7"><Reveal>
            <p className="eyebrow text-accent">{name}</p>
            <h1 className="mt-8 max-w-[10ch] text-[clamp(4rem,8.4vw,8.8rem)] font-medium leading-[0.84] tracking-[-0.078em]">{productConfig.tagline}</h1>
            <p className="mt-8 max-w-2xl text-lg leading-[1.55] text-charcoal sm:text-xl">{productConfig.description}</p>
          </Reveal>
          <Reveal delay={0.08} className="mt-10 flex flex-wrap items-start gap-x-8 gap-y-5">
              <AnalyticsLink eventName="analyze_clicked" eventLocation="homepage-hero" href={productConfig.routes.analyze} className="group inline-flex items-center gap-3 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-[#071018] transition-colors hover:bg-ice-bright">Analyze my China opportunity <span className="transition-transform group-hover:translate-x-1">→</span></AnalyticsLink>
              <AnalyticsLink eventName="demo_clicked" eventLocation="homepage-hero" href={productConfig.routes.demo} className="group inline-flex items-center gap-3 py-3.5 text-sm font-medium text-charcoal transition-colors hover:text-ink">See live demo <span className="text-accent transition-transform group-hover:translate-x-1">→</span></AnalyticsLink>
          </Reveal></div>
          <Reveal delay={0.12} className="overflow-hidden rounded-[24px] border border-line-strong bg-elevated shadow-[var(--shadow-elevated)] lg:col-span-5"><header className="flex items-center justify-between border-b border-line px-5 py-4"><div><p className="eyebrow text-accent">CHINA OPPORTUNITY MAP</p><p className="mt-2 text-xs text-stone">ACME MEDICAL</p></div><DemoLabel/></header><div className="p-5 sm:p-6"><div className="flex items-end justify-between gap-5"><div><p className="eyebrow text-stone">MARKET OPPORTUNITY</p><p className="mt-3 text-sm text-charcoal">Promising · validation needed</p></div><div className="flex items-baseline gap-2"><span className="text-6xl font-medium leading-none tracking-[-0.08em] text-accent">87</span><span className="font-mono text-[0.6rem] text-stone">/100</span></div></div><div className="mt-7 grid grid-cols-3 overflow-hidden rounded-xl border border-line bg-soft">{[["Competitors","12"],["Partners","37"],["High fit","08"]].map(([label,value])=><div key={label} className="border-r border-line p-3 last:border-r-0"><p className="font-mono text-[0.52rem] uppercase tracking-[0.08em] text-stone">{label}</p><p className="mt-3 text-2xl font-medium text-ink">{value}</p></div>)}</div><div className="mt-7"><p className="eyebrow text-stone">TOP OPPORTUNITIES</p>{opportunities.slice(0,2).map((item,index)=><div key={item.company} className="mt-4 grid grid-cols-[1fr_auto] gap-4 border-t border-line pt-4"><div><p className="text-sm font-medium">{String(index+1).padStart(2,"0")} · {item.company}</p><p className="mt-1 text-xs text-stone">{item.type} · {item.location}</p></div><span className="text-xl font-medium text-accent">{item.score}</span></div>)}</div></div></Reveal>
        </div>
      </section>

      <section id="product" className="bg-dark-soft py-20 sm:py-28">
        <div className="page-shell">
          <Reveal className="overflow-hidden rounded-[28px] border border-line-strong bg-elevated shadow-[var(--shadow-elevated)]">
            <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line px-6 py-6 sm:px-9">
              <div><p className="eyebrow text-accent">{name}</p><p className="mt-2 text-sm text-stone">ACME MEDICAL · China Opportunity Workspace</p></div><DemoLabel />
            </header>
            <div className="p-6 sm:p-9">
              <div className="flex flex-wrap items-end justify-between gap-8"><div><p className="eyebrow text-stone">CHINA OPPORTUNITY MAP</p><h2 className="mt-4 text-[clamp(2.7rem,6vw,6rem)] font-medium leading-[0.9] tracking-[-0.065em]">What is possible<br /><span className="text-charcoal">right now.</span></h2></div><div className="flex items-end gap-3"><span className="text-[clamp(4rem,8vw,7rem)] font-medium leading-none tracking-[-0.08em] text-accent">87</span><span className="pb-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-stone">Opportunity<br />score / 100</span></div></div>
              <div className="mt-10 grid overflow-hidden rounded-2xl border border-line bg-soft sm:grid-cols-3"><div className="p-5"><p className="eyebrow text-stone">Relevant competitors</p><p className="mt-5 text-4xl font-medium tracking-[-0.06em]">12</p></div><div className="border-y border-line p-5 sm:border-x sm:border-y-0"><p className="eyebrow text-stone">Potential partners</p><p className="mt-5 text-4xl font-medium tracking-[-0.06em]">37</p></div><div className="p-5"><p className="eyebrow text-stone">High-fit opportunities</p><p className="mt-5 text-4xl font-medium tracking-[-0.06em] text-accent">08</p></div></div>
              <div className="mt-10"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-medium">Top opportunities</h3><span className="text-xs text-stone">{productConfig.shortName} assessment</span></div><OpportunityRows compact /></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="how" className="py-28 sm:py-40"><div className="page-shell"><Reveal><p className="eyebrow text-accent">HOW {name} WORKS</p><h2 className="mt-7 max-w-[13ch] text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.065em]">From a product URL to a commercial path.</h2></Reveal><div className="mt-20 grid border-t border-line md:grid-cols-2 xl:grid-cols-4">{[["01","TELL US WHAT YOU SELL","Provide your company, product and China goals."],["02","MAP THE MARKET","Connect competitors, signals and commercial context."],["03","FIND OPPORTUNITIES","Discover and assess customers, distributors, partners and suppliers."],["04","MOVE TOWARD A DEAL","Track contacts and conversations through your pipeline."]].map(([number,title,copy])=><Reveal key={number} className="border-b border-line py-8 md:px-7 md:odd:border-r xl:border-r xl:last:border-r-0"><p className="font-mono text-xs text-accent">{number}</p><h3 className="mt-10 text-xl font-medium tracking-[-0.035em]">{title}</h3><p className="mt-4 text-sm leading-6 text-stone">{copy}</p></Reveal>)}</div></div></section>

      <section id="opportunities" className="bg-dark-soft py-28 sm:py-40"><div className="page-shell"><Reveal className="grid gap-10 md:grid-cols-12"><div className="md:col-span-7"><p className="eyebrow text-accent">OPPORTUNITY DISCOVERY</p><h2 className="mt-7 text-[clamp(4rem,9vw,9rem)] font-medium leading-[0.84] tracking-[-0.075em]">37 opportunities found.</h2></div><p className="max-w-md self-end text-lg leading-7 text-charcoal md:col-span-4 md:col-start-9">Customers, distributors, suppliers and partners—ranked by relevance, with the reasoning visible.</p></Reveal><Reveal className="mt-16 rounded-[24px] border border-line bg-elevated px-6 sm:px-8"><OpportunityRows /></Reveal></div></section>

      <SourceIntelligenceFlow />

      <section id="pipeline" className="border-y border-line bg-dark-soft py-28 sm:py-40"><div className="page-shell"><Reveal className="grid gap-10 lg:grid-cols-12"><div className="lg:col-span-6"><p className="eyebrow text-accent">OPPORTUNITY PIPELINE</p><h2 className="mt-7 text-[clamp(3.4rem,7vw,7rem)] font-medium leading-[0.9] tracking-[-0.07em]">From discovery<br />to deal.</h2></div><div className="self-end lg:col-span-4 lg:col-start-9"><p className="text-2xl font-medium tracking-[-0.04em]">{productConfig.shortName} finds the opportunity.</p><p className="mt-3 text-2xl tracking-[-0.04em] text-charcoal">You control the relationship.</p></div></Reveal><Reveal className="mt-16 overflow-x-auto rounded-[24px] border border-line bg-elevated p-6"><div className="flex min-w-[850px] gap-3">{pipeline.map(([stage,count],index)=><div key={stage} className="min-w-0 flex-1 rounded-xl border border-line bg-soft p-4"><div className="flex items-center justify-between"><span className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-stone">{stage}</span><span className="text-sm font-medium text-accent">{count}</span></div><div className="mt-8 h-1 overflow-hidden rounded-full bg-white/[0.04]"><div className="h-full bg-accent" style={{width:`${Math.max(12,100-index*13)}%`}} /></div></div>)}</div></Reveal></div></section>

      <section id="human" className="py-28 sm:py-40"><div className="page-shell"><Reveal className="grid gap-14 lg:grid-cols-12"><div className="lg:col-span-7"><p className="eyebrow text-accent">OPTIONAL VERIFICATION</p><h2 className="mt-7 text-[clamp(3.5rem,7vw,7.5rem)] font-medium leading-[0.88] tracking-[-0.07em]">Software first.<br /><span className="text-charcoal">Humans when it matters.</span></h2></div><div className="self-end lg:col-span-4 lg:col-start-9"><p className="text-lg leading-7 text-charcoal">{productConfig.shortName} handles discovery, intelligence and opportunity tracking.</p><p className="mt-5 text-lg leading-7 text-charcoal">When you need additional confidence, people on the ground in China can verify what the data cannot.</p><p className="mt-8 text-sm text-stone">Business registration · address · licenses · product portfolio · contact identity · Chinese-language reputation</p><AnalyticsLink eventName="verification_requested" eventLocation="homepage-human-layer" href={`mailto:${productConfig.email}?subject=${encodeURIComponent(`${productConfig.shortName} local verification`)}`} className="mt-8 inline-block border-b border-line pb-1 text-sm text-accent transition-colors hover:border-accent">Request local verification →</AnalyticsLink></div></Reveal></div></section>

      <section id="yifan" className="border-y border-line bg-elevated py-24 sm:py-32"><div className="page-shell"><Reveal className="grid gap-14 lg:grid-cols-12"><div className="lg:col-span-7"><p className="eyebrow text-accent">BUILT FROM INSIDE THE MARKET</p><h2 className="mt-7 max-w-[15ch] text-[clamp(2.8rem,5.5vw,5.7rem)] font-medium leading-[0.94] tracking-[-0.06em]">{productConfig.shortName} started with a simple problem: most China intelligence is built from the outside.</h2><p className="mt-10 text-2xl font-medium">I don&apos;t study China from the outside.<br /><span className="text-charcoal">I operate inside it.</span></p></div><div className="self-end lg:col-span-4 lg:col-start-9"><p className="text-2xl font-medium">Yifan Fu</p><p className="mt-2 text-sm text-accent">Medical Technology · Shenzhen, China</p><p className="mt-8 leading-7 text-charcoal">Worked across product commercialization, market development, international expansion and partnerships inside China&apos;s medical technology industry.</p><div className="mt-10 border-t border-line pt-6"><p className="text-5xl font-medium tracking-[-0.065em]">10+</p><p className="mt-2 text-sm text-stone">Companies advised across China market research, sourcing, commercialization and cross-border strategy.</p></div></div></Reveal></div></section>

      <section id="contact" className="py-28 sm:py-40"><div className="page-shell"><Reveal><p className="eyebrow text-accent">START WITH YOUR COMPANY</p><h2 className="mt-7 max-w-[14ch] text-[clamp(3.6rem,8vw,8rem)] font-medium leading-[0.88] tracking-[-0.075em]">What could China look like for your company?</h2><div className="mt-12 flex flex-wrap gap-x-8 gap-y-5"><AnalyticsLink eventName="analyze_clicked" eventLocation="homepage-final" href={productConfig.routes.analyze} className="group inline-flex items-center gap-3 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-[#071018] hover:bg-ice-bright">Analyze my China opportunity <span className="transition-transform group-hover:translate-x-1">→</span></AnalyticsLink><AnalyticsLink eventName="demo_clicked" eventLocation="homepage-final" href={productConfig.routes.demo} className="group inline-flex items-center gap-3 py-3.5 text-sm font-medium text-charcoal hover:text-ink">See live demo <span className="text-accent transition-transform group-hover:translate-x-1">→</span></AnalyticsLink></div><AnalyticsLink eventName="email_clicked" eventLocation="homepage-final" href={`mailto:${productConfig.email}`} className="mt-14 inline-block border-b border-line pb-1 text-sm text-stone transition-colors hover:border-accent hover:text-ink">{productConfig.email}</AnalyticsLink></Reveal></div></section>

      <footer className="border-t border-line py-8"><div className="page-shell flex flex-wrap items-center justify-between gap-4 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-stone"><p>{name}</p><p>China Opportunity Intelligence</p><p>© {new Date().getFullYear()} {productConfig.shortName}</p><p>China ↔ World</p></div></footer>
    </main>
  );
}
