"use client";

import { motion, useReducedMotion } from "motion/react";

const sourceGroups = [
  {
    category: "Commercial data",
    label: "市场与交易",
    sources: ["Alibaba · 阿里巴巴", "1688", "JD · 京东"],
  },
  {
    category: "Social signals",
    label: "市场声音",
    sources: ["WeChat · 微信", "Xiaohongshu · 小红书", "Douyin · 抖音"],
  },
  {
    category: "Authoritative sources",
    label: "权威信息",
    sources: ["NMPA · 国家药监局", "Government procurement · 政府采购", "Tenders · 招投标", "Company announcements · 企业公告"],
  },
] as const;

const outputs = [
  ["37", "Potential partners"],
  ["12", "Competitors"],
  ["06", "Regulatory requirements"],
  ["03", "Relevant tenders"],
  ["08", "High-fit opportunities"],
] as const;

function SignalLine({ vertical = false, delay = 0 }: { vertical?: boolean; delay?: number }) {
  const reduceMotion = useReducedMotion();
  const position = ["0%", "100%"];

  return (
    <div aria-hidden="true" className={`relative overflow-hidden bg-accent/20 ${vertical ? "mx-auto h-14 w-px" : "h-px w-full"}`}>
      <motion.span
        className={`absolute rounded-full bg-accent shadow-[0_0_12px_rgba(141,212,255,0.72)] ${vertical ? "-left-[3px] h-1.5 w-1.5" : "-top-[3px] h-1.5 w-1.5"}`}
        style={vertical ? { top: position[0] } : { left: position[0] }}
        animate={reduceMotion ? undefined : vertical ? { top: position, opacity: [0, 1, 1, 0] } : { left: position, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3.8, delay, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function SourceGroups() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
      {sourceGroups.map((group, groupIndex) => (
        <motion.article
          key={group.category}
          initial={reduceMotion ? false : { opacity: 0, x: -16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, delay: groupIndex * 0.09, ease: [0.22, 1, 0.36, 1] }}
          className="border-t border-line px-1 py-5 sm:px-4 xl:grid xl:grid-cols-[9.5rem_1fr] xl:items-start xl:gap-5"
        >
          <div>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-accent">{group.category}</p>
            <p className="mt-1 text-xs text-stone">{group.label}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 xl:mt-0">
            {group.sources.map((source) => <span key={source} className="border border-line bg-white/[0.025] px-2.5 py-2 text-xs text-charcoal">{source}</span>)}
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function MeridianCore() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.55 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-52 items-center justify-center overflow-hidden border border-accent/35 bg-accent/[0.08] p-6 text-center shadow-[0_0_70px_rgba(141,212,255,0.055)]"
    >
      <motion.span aria-hidden="true" className="absolute h-28 w-28 rounded-full border border-accent/20" animate={reduceMotion ? undefined : { scale: [0.86, 1.28], opacity: [0.5, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeOut" }} />
      <div className="relative">
        <span className="mx-auto block h-2 w-2 rounded-full bg-accent shadow-[0_0_18px_rgba(141,212,255,0.8)]" />
        <p className="mt-6 text-2xl font-semibold tracking-[-0.05em]">MERIDIAN</p>
        <p className="mt-3 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-accent">Intelligence layer</p>
        <p className="mt-5 text-xs leading-5 text-stone">Organize · assess · prioritize</p>
      </div>
    </motion.div>
  );
}

function CommercialOutputs() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="border-t border-line">
      <div className="flex items-center justify-between border-b border-line py-3">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-accent">Commercial intelligence</p>
        <span className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-stone">Demo output</span>
      </div>
      {outputs.map(([value, label], index) => (
        <motion.div key={label} initial={reduceMotion ? false : { opacity: 0, x: 14 }} whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }} className="grid grid-cols-[4rem_1fr] items-baseline border-b border-line py-4">
          <span className="text-2xl font-medium tracking-[-0.06em] text-accent">{value}</span>
          <span className="text-sm text-charcoal">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function SourceIntelligenceFlow() {
  return (
    <section id="intelligence" className="technical-grid border-y border-line bg-dark-soft py-28 sm:py-40">
      <div className="page-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow text-accent">INFORMATION IS LEVERAGE</p>
            <h2 className="mt-7 text-[clamp(4.4rem,10vw,11rem)] font-medium leading-[0.78] tracking-[-0.085em]">FIGHT<br />UNFAIR.</h2>
          </div>
          <div className="lg:col-span-3 lg:col-start-10 lg:pb-3">
            <p className="text-[clamp(1.7rem,3vw,2.6rem)] font-medium leading-[1.05] tracking-[-0.055em]">Know what your competitors don&apos;t.</p>
            <p className="mt-5 font-mono text-[0.58rem] uppercase leading-5 tracking-[0.12em] text-stone">An information advantage. Nothing else.</p>
          </div>
        </div>

        <div className="mt-20 border-t border-line pt-7 sm:mt-28">
          <div className="mb-9 flex flex-wrap items-center justify-between gap-3">
            <div><p className="eyebrow text-stone">CHINA&apos;S INFORMATION ENVIRONMENT</p><p className="mt-2 text-sm text-charcoal">Signals across China&apos;s digital ecosystem</p></div>
            <p className="font-mono text-[0.54rem] uppercase tracking-[0.1em] text-stone">Fragmented sources → commercial action</p>
          </div>

          <div className="hidden grid-cols-[minmax(0,1.3fr)_4rem_minmax(12rem,0.58fr)_4rem_minmax(0,0.9fr)] items-center gap-4 xl:grid">
            <SourceGroups />
            <SignalLine />
            <MeridianCore />
            <SignalLine delay={0.8} />
            <CommercialOutputs />
          </div>

          <div className="xl:hidden">
            <SourceGroups />
            <SignalLine vertical />
            <MeridianCore />
            <SignalLine vertical delay={0.8} />
            <CommercialOutputs />
          </div>
        </div>

        <p className="mt-8 max-w-4xl text-xs leading-5 text-stone">Illustrative source map. Meridian is being built to analyze sources including those shown; access, automation and coverage vary by source and use case. Platform identifiers do not imply partnership, endorsement or complete access.</p>
      </div>
    </section>
  );
}
