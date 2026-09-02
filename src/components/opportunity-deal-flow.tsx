"use client";

import { track } from "@vercel/analytics";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const opportunities = [
  { company: "Shanghai Medical Distributor", type: "Distributor", signals: ["Strong product overlap", "Relevant hospital network", "Regulatory fit to validate"] },
  { company: "Suzhou Contract Manufacturer", type: "Supplier", signals: ["Adjacent device capability", "Export experience to verify", "Quality systems to confirm"] },
  { company: "Guangzhou Clinical Network", type: "Customer", signals: ["Specialty alignment", "Multi-site access", "Procurement path to validate"] },
] as const;

const stages = ["FOUND", "QUALIFIED", "CONTACTED", "REPLIED", "INTERESTED", "DEAL"] as const;

function useViewEvent(eventName: "opportunity_pipeline_viewed" | "regulatory_map_viewed") {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const tracked = useRef(false);
  useEffect(() => {
    if (inView && !tracked.current) {
      tracked.current = true;
      track(eventName);
    }
  }, [eventName, inView]);
  return ref;
}

function RegulatoryMap() {
  const ref = useViewEvent("regulatory_map_viewed");
  return (
    <div ref={ref} className="border border-line-strong bg-elevated p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4"><p className="eyebrow text-accent">REGULATORY MAP</p><span className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-stone">Example assessment</span></div>
      <div className="divide-y divide-line">{[
        ["Likely classification", "Product-specific review required"],
        ["Relevant requirements", "Registration pathway · labeling · evidence"],
        ["What to validate", "Intended use · claims · existing certifications"],
        ["Primary sources", "NMPA · official standards"],
        ["Confidence", "Preliminary"],
      ].map(([label, value]) => <div key={label} className="grid gap-2 py-4 sm:grid-cols-[8.5rem_1fr]"><p className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-stone">{label}</p><p className="text-sm leading-5 text-charcoal">{value}</p></div>)}</div>
      <p className="mt-4 text-xs leading-5 text-stone">A starting map for validation—not legal or regulatory advice.</p>
    </div>
  );
}

export function OpportunityDealFlow() {
  const sectionRef = useViewEvent("opportunity_pipeline_viewed");
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const [stage, setStage] = useState(0);
  const opportunity = opportunities[selected];

  return (
    <section id="product" className="border-b border-line bg-paper py-12 sm:py-16">
      <div ref={sectionRef} className="page-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-8"><p className="eyebrow text-accent">ONE COMMERCIAL JOURNEY</p><h2 className="mt-6 max-w-[12ch] text-[clamp(3.8rem,7vw,7.4rem)] font-medium leading-[0.86] tracking-[-0.075em]">Find the opportunity.<br /><span className="text-charcoal">Move it forward.</span></h2></div><div className="lg:col-span-3 lg:col-start-10"><p className="text-xl font-medium tracking-[-0.035em]">Meridian finds the opportunity.</p><p className="mt-2 text-xl text-charcoal">You control the relationship.</p></div></div>
        <div className="mt-8 grid gap-5 lg:grid-cols-12">
          <div className="border border-line-strong bg-elevated p-5 sm:p-7 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-line pb-4"><p className="eyebrow text-stone">OPPORTUNITY</p><span className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-accent">Demo data</span></div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">{opportunities.map((item, index) => <button key={item.company} type="button" onClick={() => { setSelected(index); setStage(0); }} className={`border p-3 text-left transition-colors ${selected === index ? "border-accent/45 bg-accent/[0.08]" : "border-line bg-soft hover:border-line-strong"}`}><span className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-stone">{item.type}</span><span className="mt-2 block text-sm font-medium leading-5">{item.company}</span></button>)}</div>
            <div className="mt-6 min-h-48 border border-line bg-soft p-5"><AnimatePresence mode="wait" initial={false}><motion.div key={opportunity.company} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: reduceMotion ? 0.01 : 0.42, ease: [0.22, 1, 0.36, 1] }}><p className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-accent">WHY IT MATTERS</p><h3 className="mt-4 text-2xl font-medium tracking-[-0.045em]">{opportunity.company}</h3><div className="mt-6 grid gap-3 sm:grid-cols-3">{opportunity.signals.map((signal) => <p key={signal} className="border-t border-line pt-3 text-sm leading-5 text-charcoal">✓ {signal}</p>)}</div></motion.div></AnimatePresence></div>
            <div className="mt-6"><div className="mb-3 flex items-center justify-between"><p className="eyebrow text-stone">MOVE TOWARD A DEAL</p><span className="text-xs text-charcoal">Select a stage</span></div><div className="grid grid-cols-2 border-l border-t border-line sm:grid-cols-6">{stages.map((item, index) => <button key={item} type="button" onClick={() => setStage(index)} className={`relative min-h-16 border-b border-r border-line px-2 py-3 font-mono text-[0.52rem] tracking-[0.08em] transition-colors ${index <= stage ? "text-ink" : "text-stone"}`}>{index === stage ? <motion.span layoutId="active-pipeline-stage" className="absolute inset-0 bg-accent/[0.1]" transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }} /> : null}<span className="relative">{item}</span>{index <= stage ? <span className="absolute inset-x-0 bottom-0 h-px bg-accent" /> : null}</button>)}</div></div>
          </div>
          <div className="lg:col-span-5"><div className="mb-5 border-y border-line py-4"><p className="text-2xl font-medium tracking-[-0.04em]">Find the market.</p><p className="mt-1 text-2xl tracking-[-0.04em] text-charcoal">Understand the rules.</p></div><RegulatoryMap /></div>
        </div>
      </div>
    </section>
  );
}
