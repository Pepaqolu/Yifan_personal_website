import { chinaDeskContent as desk } from "@/content/china-desk";
import { Reveal } from "./reveal";
import { AnalyticsLink } from "./analytics-link";

export function ChinaDeskHome() {
  return (
    <section id="china-desk" className="scroll-mt-16 bg-dark text-paper">
      <div className="page-shell py-40 sm:py-60">
        <Reveal>
          <p className="eyebrow text-accent">{desk.name}</p>
          <p className="mt-12 text-lg tracking-[-0.025em] text-paper/48 sm:text-2xl">Need this continuously?</p>
          <h2 className="mt-8 max-w-[12ch] text-[clamp(4.2rem,10vw,10rem)] font-medium leading-[0.86] tracking-[-0.075em]">Your China team,<br /><span className="text-paper/42">without hiring a China team.</span></h2>
        </Reveal>
        <div className="mt-24 grid gap-16 border-t border-paper/15 pt-8 md:mt-40 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-6 md:col-start-2">
            <p className="text-[clamp(1.8rem,3.4vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.05em]">{desk.description}</p>
          </Reveal>
          <Reveal delay={0.08} className="md:col-span-3 md:col-start-10 md:self-end">
            <p className="leading-[1.75] text-paper/52">{desk.supporting.map((item) => <span key={item} className="block">{item}.</span>)}</p>
          </Reveal>
        </div>
        <Reveal className="mt-20 sm:mt-28">
          <AnalyticsLink eventName="China Desk clicked" eventLocation="homepage-section" href="/desk" className="group inline-flex items-center gap-4 text-base font-medium sm:text-lg">
            <span className="border-b border-paper/25 pb-1.5 transition-colors duration-500 group-hover:border-accent">Explore China Desk</span>
            <span aria-hidden="true" className="text-accent transition-transform duration-500 group-hover:translate-x-1">→</span>
          </AnalyticsLink>
        </Reveal>
      </div>
    </section>
  );
}
