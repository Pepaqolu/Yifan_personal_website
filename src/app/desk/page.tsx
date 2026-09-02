import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsLink } from "@/components/analytics-link";
import { DeskHeader } from "@/components/desk-header";
import { Reveal } from "@/components/reveal";
import { chinaDeskContent as desk } from "@/content/china-desk";

const title = "China Desk — China, from the inside";
const description = "Continuous China-side market intelligence, research, partner discovery and real-world execution for international companies.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/desk" },
  openGraph: { type: "website", title, description, url: "/desk", images: [] },
  twitter: { card: "summary", title, description, images: [] },
};

export default function DeskPage() {
  return (
    <>
      <DeskHeader />
      <main>
        <section className="technical-grid min-h-[100svh] bg-paper">
          <div className="page-shell flex min-h-[100svh] flex-col justify-center pb-16 pt-36 sm:pt-32">
            <Reveal>
              <p className="eyebrow text-stone">YIFAN FU / CHINA DESK</p>
              <h1 className="mt-10 max-w-[10ch] text-[clamp(5rem,13vw,13rem)] font-medium leading-[0.82] tracking-[-0.08em]">China,<br /><span className="text-charcoal">from the inside.</span></h1>
            </Reveal>
            <div className="mt-16 grid gap-12 border-t border-line pt-8 md:mt-24 md:grid-cols-12 md:gap-8">
              <Reveal className="md:col-span-6 md:col-start-2">
                <p className="text-[clamp(1.6rem,3.3vw,3.3rem)] font-medium leading-[1.05] tracking-[-0.05em]">Continuous intelligence and execution for companies navigating the Chinese market.</p>
              </Reveal>
              <Reveal delay={0.08} className="flex flex-col items-start gap-5 md:col-span-3 md:col-start-10 md:self-end">
                <AnalyticsLink eventName="Private access clicked" eventLocation="desk-hero" href={desk.access.href} className="group inline-flex items-center gap-3 text-sm font-medium sm:text-base"><span className="border-b border-ink/25 pb-1">Request private access</span><span className="text-accent transition-transform group-hover:translate-x-1">→</span></AnalyticsLink>
                <AnalyticsLink eventName="Dashboard demo viewed" eventLocation="desk-hero" href="/meridian/demo" className="text-sm text-stone hover:text-accent">Explore the dashboard ↓</AnalyticsLink>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-dark-soft">
          <div className="page-shell py-36 sm:py-56">
            <Reveal>
              <p className="eyebrow text-stone">CONTINUOUS BY DESIGN</p>
              <h2 className="mt-10 max-w-[13ch] text-[clamp(3.8rem,8.5vw,8.5rem)] font-medium leading-[0.88] tracking-[-0.073em]">{desk.problem.headline}</h2>
            </Reveal>
            <div className="mt-28 grid gap-16 border-t border-line pt-8 md:mt-44 md:grid-cols-12 md:gap-8">
              <Reveal className="md:col-span-5 md:col-start-2"><p className="text-[clamp(1.7rem,3vw,3rem)] font-medium leading-[1.18] tracking-[-0.05em] text-stone">{desk.problem.changes.map((change) => <span key={change} className="block">{change}</span>)}</p></Reveal>
              <Reveal delay={0.08} className="md:col-span-5 md:col-start-7 md:self-end"><p className="text-[clamp(2.8rem,5.5vw,5.5rem)] font-medium leading-[0.94] tracking-[-0.065em]">{desk.problem.answer}</p></Reveal>
            </div>
          </div>
        </section>

        <section className="bg-dark-soft">
          <div className="page-shell pb-40 sm:pb-60">
            <p className="eyebrow text-stone">THE DESK</p>
            <div className="mt-16 border-t border-line sm:mt-24">
              {desk.capabilities.map((capability) => (
                <div key={capability.number} className="grid gap-4 border-b border-line py-8 transition-colors duration-500 hover:bg-white/[0.018] sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:px-5 sm:py-10">
                  <span className="font-mono text-[0.65rem] text-stone sm:col-span-1">{capability.number}</span>
                  <h3 className="text-[clamp(1.8rem,3.5vw,3.5rem)] font-medium tracking-[-0.055em] sm:col-span-5">{capability.title}</h3>
                  <p className="max-w-xl text-sm leading-[1.65] text-stone sm:col-span-5 sm:col-start-8 sm:text-base">{capability.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-elevated text-paper">
          <div className="page-shell py-40 sm:py-60">
            <Reveal>
              {desk.differentiator.lines.map((line, index) => <p key={line} className={`max-w-[14ch] text-[clamp(3.4rem,8vw,8rem)] font-medium leading-[0.9] tracking-[-0.072em] ${index ? "text-paper/45" : ""}`}>{line}</p>)}
            </Reveal>
            <div className="mt-28 grid gap-16 border-t border-paper/15 pt-8 md:mt-44 md:grid-cols-12 md:gap-8">
              <Reveal className="md:col-span-5 md:col-start-2">
                {desk.differentiator.supporting.map((line) => <p key={line} className="text-xl leading-[1.35] tracking-[-0.035em] text-paper/55 sm:text-2xl">{line}</p>)}
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-dark-soft">
          <div className="page-shell py-40 sm:py-60">
            <Reveal><h2 className="max-w-[14ch] text-[clamp(3.5rem,8vw,8rem)] font-medium leading-[0.9] tracking-[-0.072em]">{desk.compounding.headline}</h2></Reveal>
            <div className="mt-28 grid gap-16 border-t border-line pt-8 md:mt-44 md:grid-cols-12 md:gap-8">
              <Reveal className="md:col-span-4 md:col-start-2"><p className="text-lg leading-[1.55] tracking-[-0.025em] text-stone">{desk.compounding.intro}</p></Reveal>
              <Reveal delay={0.08} className="md:col-span-5 md:col-start-7"><p className="text-[clamp(1.6rem,3vw,3rem)] font-medium leading-[1.15] tracking-[-0.05em]">{desk.compounding.context.map((item) => <span key={item} className="block">{item}</span>)}</p></Reveal>
            </div>
            <Reveal className="mt-32 sm:mt-48">
              {desk.compounding.close.map((line, index) => <p key={line} className={`text-[clamp(2.6rem,5.5vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.065em] ${index ? "text-accent" : "text-stone"}`}>{line}</p>)}
              <AnalyticsLink eventName="Dashboard demo viewed" eventLocation="desk-body" href="/meridian/demo" className="group mt-20 inline-flex items-center gap-4 text-base font-medium sm:mt-28 sm:text-lg"><span className="border-b border-ink/25 pb-1.5 group-hover:border-accent">Explore the dashboard demo</span><span className="text-accent transition-transform group-hover:translate-x-1">→</span></AnalyticsLink>
            </Reveal>
          </div>
        </section>

        <section id="access" className="scroll-mt-24 bg-paper">
          <div className="page-shell py-36 sm:py-56">
            <Reveal>
              <p className="eyebrow text-accent">{desk.access.label}</p>
              <h2 className="mt-10 max-w-[18ch] text-[clamp(3.5rem,8vw,8rem)] font-medium leading-[0.9] tracking-[-0.072em]">{desk.access.message}</h2>
              <AnalyticsLink eventName="Private access clicked" eventLocation="desk-access" href={desk.access.href} className="group mt-20 inline-flex items-center gap-4 text-base font-medium sm:mt-28 sm:text-lg"><span className="border-b border-ink/25 pb-1.5 group-hover:border-accent">{desk.access.cta}</span><span className="text-accent transition-transform group-hover:translate-x-1">→</span></AnalyticsLink>
            </Reveal>
          </div>
        </section>
      </main>
      <footer className="bg-paper pb-8"><div className="page-shell flex justify-between border-t border-line pt-5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-stone"><span>China Desk</span><Link href="/">Yifan.world</Link></div></footer>
    </>
  );
}
