import { chinaDeskContent as desk } from "@/content/china-desk";
import { Reveal } from "./reveal";
import { AnalyticsLink } from "./analytics-link";

export function ChinaDeskHome() {
  return (
    <section id="china-desk" className="scroll-mt-16">
      <div className="bg-dark text-paper">
        <div className="page-shell py-40 sm:py-60">
          <Reveal>
            <p className="eyebrow text-accent">{desk.name}</p>
            <h2 className="mt-10 max-w-[12ch] text-[clamp(4.2rem,10vw,10rem)] font-medium leading-[0.86] tracking-[-0.075em]">Your China team,<br /><span className="text-paper/42">without hiring a China team.</span></h2>
          </Reveal>
          <div className="mt-24 grid gap-16 border-t border-paper/15 pt-8 md:mt-40 md:grid-cols-12 md:gap-8">
            <Reveal className="md:col-span-6 md:col-start-2">
              <p className="text-[clamp(1.8rem,3.4vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.05em]">{desk.description}</p>
              <p className="mt-10 max-w-xl text-base leading-[1.65] text-paper/48 sm:text-lg">{desk.honestDefinition}</p>
            </Reveal>
            <Reveal delay={0.08} className="md:col-span-3 md:col-start-10 md:self-end">
              <p className="leading-[1.75] text-paper/52">{desk.supporting.map((item) => <span key={item} className="block">{item}.</span>)}</p>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="bg-paper">
        <div className="page-shell py-40 sm:py-60">
          <Reveal>
            <p className="max-w-[14ch] text-[clamp(3.6rem,8vw,8rem)] font-medium leading-[0.9] tracking-[-0.073em]">{desk.problem.headline}</p>
          </Reveal>
          <div className="mt-28 grid gap-20 border-t border-line pt-8 md:mt-44 md:grid-cols-12 md:gap-8">
            <Reveal className="md:col-span-4 md:col-start-2">
              <p className="text-[clamp(1.7rem,3.2vw,3.2rem)] font-medium leading-[1.15] tracking-[-0.05em] text-stone">{desk.problem.changes.map((item) => <span key={item} className="block">{item}</span>)}</p>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-6 md:col-start-7 md:self-end">
              <p className="text-[clamp(3rem,6.5vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.07em]">{desk.problem.answer}</p>
            </Reveal>
          </div>
        </div>

        <div className="page-shell pb-40 sm:pb-60">
          <p className="eyebrow text-stone">WHAT CHINA DESK DOES</p>
          <div className="mt-16 border-t border-line sm:mt-24">
            {desk.capabilities.map((capability, index) => (
              <Reveal key={capability.number} delay={index * 0.025} className="grid gap-4 border-b border-line py-8 sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:py-10">
                <span className="font-mono text-[0.65rem] tracking-[0.12em] text-stone sm:col-span-1">{capability.number}</span>
                <h3 className="text-[clamp(1.9rem,3.8vw,3.8rem)] font-medium leading-none tracking-[-0.055em] sm:col-span-5">{capability.title}</h3>
                <p className="max-w-xl text-sm leading-[1.65] text-stone sm:col-span-5 sm:col-start-8 sm:text-base">{capability.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-dark-soft text-paper">
        <div className="page-shell py-40 sm:py-60">
          <Reveal>
            {desk.differentiator.lines.map((line, index) => <p key={line} className={`max-w-[14ch] text-[clamp(3.4rem,8vw,8rem)] font-medium leading-[0.9] tracking-[-0.072em] ${index ? "text-paper/45" : ""}`}>{line}</p>)}
          </Reveal>
          <div className="mt-28 grid gap-16 border-t border-paper/15 pt-8 md:mt-44 md:grid-cols-12 md:gap-8">
            <Reveal className="md:col-span-5 md:col-start-2">
              {desk.differentiator.supporting.map((line) => <p key={line} className="text-xl leading-[1.35] tracking-[-0.035em] text-paper/55 sm:text-2xl">{line}</p>)}
            </Reveal>
            <Reveal delay={0.08} className="md:col-span-4 md:col-start-8">
              <p className="font-mono text-[0.68rem] uppercase leading-[2] tracking-[0.11em] text-paper/38">{desk.differentiator.equation.map((item, index) => <span key={item} className="block">{index ? "+ " : ""}{item}</span>)}</p>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="bg-paper">
        <div className="page-shell py-40 sm:py-60">
          <Reveal><h2 className="max-w-[14ch] text-[clamp(3.5rem,8vw,8rem)] font-medium leading-[0.9] tracking-[-0.072em]">{desk.compounding.headline}</h2></Reveal>
          <div className="mt-28 grid gap-16 border-t border-line pt-8 md:mt-44 md:grid-cols-12 md:gap-8">
            <Reveal className="md:col-span-4 md:col-start-2">
              <p className="text-lg leading-[1.55] tracking-[-0.025em] text-stone">{desk.compounding.intro}</p>
            </Reveal>
            <Reveal delay={0.08} className="md:col-span-5 md:col-start-7">
              <p className="text-[clamp(1.6rem,3vw,3rem)] font-medium leading-[1.15] tracking-[-0.05em]">{desk.compounding.context.map((item) => <span key={item} className="block">{item}</span>)}</p>
            </Reveal>
          </div>
          <Reveal className="mt-32 sm:mt-48">
            {desk.compounding.close.map((line, index) => <p key={line} className={`text-[clamp(2.6rem,5.5vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.065em] ${index ? "text-accent" : "text-stone"}`}>{line}</p>)}
          </Reveal>
        </div>
      </div>

      <div className="bg-dark text-paper">
        <div className="page-shell py-36 sm:py-52">
          <Reveal>
            <p className="eyebrow text-accent">{desk.access.label}</p>
            <p className="mt-10 max-w-[22ch] text-[clamp(2.4rem,5vw,5rem)] font-medium leading-[0.98] tracking-[-0.06em]">{desk.access.message}</p>
            <AnalyticsLink eventName="Private access clicked" eventLocation="homepage" href={desk.access.href} className="group mt-16 inline-flex items-center gap-4 text-base font-medium sm:mt-24 sm:text-lg">
              <span className="border-b border-paper/25 pb-1.5 transition-colors duration-500 group-hover:border-accent">{desk.access.cta}</span><span aria-hidden="true" className="text-accent transition-transform duration-500 group-hover:translate-x-1">→</span>
            </AnalyticsLink>
            <p className="mt-20 text-sm leading-[1.65] text-paper/35 sm:mt-28 sm:text-base">{desk.access.followUp.map((line) => <span key={line} className="block">{line}</span>)}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
