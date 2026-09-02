import { AnalyticsLink } from "@/components/analytics-link";
import { HomepageAnalyzer } from "@/components/homepage-analyzer";
import { OpportunityDealFlow } from "@/components/opportunity-deal-flow";
import { Reveal } from "@/components/reveal";
import { SourceIntelligenceFlow } from "@/components/source-intelligence-flow";
import { productConfig } from "@/config/productConfig";

function DemoLabel() {
  return <span className="inline-flex border border-accent/25 bg-accent/[0.08] px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-accent">Demo data</span>;
}

export function MeridianHome() {
  const name = productConfig.shortName.toUpperCase();
  return (
    <main>
      <section id="top" className="technical-grid relative flex min-h-[100svh] items-center overflow-hidden border-b border-line pt-32 sm:pt-40">
        <div className="page-shell grid w-full gap-12 pb-14 lg:grid-cols-12 lg:items-center sm:pb-20">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow text-accent">{name}</p>
              <h1 className="mt-7 max-w-[10ch] text-[clamp(4rem,8.4vw,8.8rem)] font-medium leading-[0.84] tracking-[-0.078em]">{productConfig.tagline}</h1>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-charcoal">{["Customers", "Distributors", "Partners", "Suppliers"].map((type) => <span key={type}>{type}</span>)}</div>
              <p className="mt-6 max-w-xl text-base leading-6 text-charcoal sm:text-lg">{productConfig.description}</p>
            </Reveal>
            <Reveal delay={0.08} className="mt-9">
              <HomepageAnalyzer eventName="hero_analyze_started" />
              <AnalyticsLink eventName="hero_demo_clicked" eventLocation="homepage-hero" href={productConfig.routes.demo} className="group mt-5 inline-flex items-center gap-3 text-sm font-medium text-charcoal transition-colors hover:text-ink">See demo <span className="text-accent transition-transform group-hover:translate-x-1">→</span></AnalyticsLink>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="border border-line-strong bg-elevated p-5 shadow-[var(--shadow-elevated)] lg:col-span-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-line pb-4"><p className="eyebrow text-stone">YOUR PRODUCT</p><DemoLabel /></div>
            <div className="flex justify-center py-4"><span className="h-8 w-px bg-accent/30" /></div>
            <div className="border border-accent/35 bg-accent/[0.08] p-5 text-center"><span className="mx-auto block h-2 w-2 rounded-full bg-accent shadow-[0_0_16px_rgba(141,212,255,0.7)]" /><p className="mt-4 text-xl font-semibold tracking-[-0.04em]">MERIDIAN</p><p className="mt-2 font-mono text-[0.54rem] uppercase tracking-[0.1em] text-accent">Find · understand · prioritize</p></div>
            <div className="flex justify-center py-4"><span className="h-8 w-px bg-accent/30" /></div>
            <div className="grid grid-cols-2 border-l border-t border-line">{["Distributor", "Customer", "Supplier", "Competitor"].map((type) => <div key={type} className="border-b border-r border-line p-4 text-center text-sm text-charcoal">{type}</div>)}</div>
            <p className="mt-4 text-center font-mono text-[0.54rem] uppercase tracking-[0.1em] text-stone">Product URL → Market → Opportunities → Deal</p>
          </Reveal>
        </div>
      </section>

      <SourceIntelligenceFlow />
      <OpportunityDealFlow />

      <section id="contact" className="bg-dark-soft py-12 sm:py-16">
        <div className="page-shell">
          <div className="mb-10 flex flex-col gap-5 border-y border-line py-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="eyebrow text-accent">NEED CERTAINTY?</p><p className="mt-2 max-w-2xl text-sm leading-6 text-charcoal">When data is not enough, request China-side verification of companies and market information.</p></div>
            <AnalyticsLink eventName="verification_requested" eventLocation="homepage-trust-strip" href={`mailto:${productConfig.email}?subject=${encodeURIComponent(`${productConfig.shortName} local verification`)}`} className="shrink-0 text-sm font-medium text-accent">Request local verification →</AnalyticsLink>
          </div>

          <Reveal>
            <p className="eyebrow text-accent">START WITH YOUR COMPANY</p>
            <h2 className="mt-5 max-w-[13ch] text-[clamp(3.6rem,8vw,5.5rem)] font-medium leading-[0.86] tracking-[-0.075em]">What could China look like for your company?</h2>
            <div className="mt-8"><HomepageAnalyzer eventName="final_analyze_clicked" compact /></div>
            <AnalyticsLink eventName="demo_clicked" eventLocation="homepage-final" href={productConfig.routes.demo} className="group mt-5 inline-flex items-center gap-3 text-sm font-medium text-charcoal hover:text-ink">See demo <span className="text-accent transition-transform group-hover:translate-x-1">→</span></AnalyticsLink>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-line py-7"><div className="page-shell flex flex-wrap items-center justify-between gap-4 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-stone"><p>{name}</p><p>China Opportunity Intelligence</p><p>© 2026 {productConfig.shortName}</p><p>China ↔ World</p></div></footer>
    </main>
  );
}
