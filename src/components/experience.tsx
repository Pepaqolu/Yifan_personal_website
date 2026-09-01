"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { siteContent } from "@/content/site";
import { Reveal } from "./reveal";
import { ScrollProgressDebug } from "./scroll-progress-debug";

export function Experience() {
  const betweenRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: betweenRef, offset: ["start start", "end end"] });
  const leftX = useTransform(scrollYProgress, [0, 0.15, 0.35, 0.9, 1], ["-4vw", "-4vw", "-0.75vw", "-0.75vw", "-0.35vw"]);
  const rightX = useTransform(scrollYProgress, [0, 0.15, 0.35, 0.9, 1], ["4vw", "4vw", "0.75vw", "0.75vw", "0.35vw"]);
  const charactersOpacity = useTransform(scrollYProgress, [0, 0.92, 1], [1, 1, 0.82]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.55, 0.63, 0.95, 1], [0, 0, 1, 1, 0.75]);
  const statementOpacity = useTransform(scrollYProgress, [0, 0.7, 0.78, 0.96, 1], [0, 0, 1, 1, 0.82]);
  const copyY = useTransform(scrollYProgress, [0.55, 0.7, 0.78], [14, 14, 0]);

  return (
    <section id="perspective">
      <div id="between" ref={betweenRef} className="relative h-[185svh] scroll-mt-16 sm:h-[205svh]">
        <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden bg-paper [contain:paint]">
          <motion.div style={{ opacity: reduceMotion ? 1 : charactersOpacity }} className="relative flex w-full items-center justify-center" aria-label="之间 — between">
            <motion.span aria-hidden="true" style={{ x: reduceMotion ? 0 : leftX }} className="select-none text-[clamp(10.5rem,42vw,42rem)] font-medium leading-[0.62] tracking-[-0.13em] sm:text-[clamp(15rem,42vw,42rem)]">{siteContent.between.leftCharacter}</motion.span>
            <motion.span aria-hidden="true" style={{ x: reduceMotion ? 0 : rightX }} className="select-none text-[clamp(10.5rem,42vw,42rem)] font-medium leading-[0.62] tracking-[-0.13em] sm:text-[clamp(15rem,42vw,42rem)]">{siteContent.between.rightCharacter}</motion.span>
          </motion.div>
          <motion.div style={{ y: reduceMotion ? 0 : copyY }} className="absolute inset-x-0 bottom-[10vh] text-center">
            <motion.p style={{ opacity: reduceMotion ? 1 : labelOpacity }} className="eyebrow text-accent">{siteContent.between.label}</motion.p>
            <motion.p style={{ opacity: reduceMotion ? 1 : statementOpacity }} className="mt-4 text-[clamp(1.4rem,2.8vw,2.8rem)] font-medium tracking-[-0.05em]">
              <span>Two lenses.</span><span className="text-stone"> One perspective.</span>
            </motion.p>
          </motion.div>
          <ScrollProgressDebug label="BETWEEN" progress={scrollYProgress} />
        </div>
      </div>

      <div id="experience" className="page-shell scroll-mt-20 py-36 sm:py-56">
        <Reveal>
          <p className="eyebrow text-stone">{siteContent.experience.label}</p>
          <h2 className="mt-10 text-[clamp(4.2rem,13vw,13rem)] font-semibold leading-[0.8] tracking-[-0.08em]">{siteContent.experience.company}</h2>
          <p className="mt-8 text-sm tracking-[-0.02em] text-stone sm:text-base">{siteContent.experience.context}</p>
        </Reveal>

        <div className="mt-24 grid gap-16 border-t border-line pt-8 md:mt-40 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-7 md:col-start-2">
            <p className="max-w-3xl text-[clamp(1.8rem,3.6vw,3.6rem)] font-medium leading-[1.06] tracking-[-0.055em]">{siteContent.experience.summary}</p>
            <p className="mt-10 max-w-xl text-base leading-[1.6] text-stone sm:text-lg">{siteContent.experience.focus}</p>
          </Reveal>
        </div>

        <div className="mt-36 grid gap-10 border-t border-line pt-8 md:mt-56 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-5 md:col-start-2">
            <p className="text-[clamp(7rem,15vw,15rem)] font-medium leading-[0.75] tracking-[-0.085em]">{siteContent.experience.metric}</p>
            <p className="mt-8 text-[clamp(1.6rem,3vw,3rem)] font-medium tracking-[-0.05em]">{siteContent.experience.metricLabel}</p>
          </Reveal>
          <Reveal delay={0.08} className="md:col-span-4 md:col-start-8 md:self-end">
            <p className="max-w-md text-lg leading-[1.55] tracking-[-0.025em] text-stone">{siteContent.experience.metricSummary}</p>
          </Reveal>
        </div>
      </div>

      <div className="page-shell flex min-h-[110svh] flex-col justify-center py-32 sm:py-48">
        <Reveal>
          {siteContent.operator.statement.map((line, index) => (
            <p key={line} className={`max-w-[15ch] text-[clamp(3.5rem,8.5vw,8.5rem)] font-medium leading-[0.89] tracking-[-0.075em] ${index ? "text-stone" : ""}`}>{line}</p>
          ))}
          <p className="mt-16 max-w-xl text-base leading-[1.7] tracking-[-0.02em] text-stone sm:mt-24 sm:text-xl">{siteContent.operator.context}</p>
        </Reveal>
      </div>
    </section>
  );
}
