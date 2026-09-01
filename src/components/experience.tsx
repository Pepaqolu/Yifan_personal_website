"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { siteContent } from "@/content/site";
import { Reveal } from "./reveal";

export function Experience() {
  const betweenRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: betweenRef,
    offset: ["start start", "end end"],
  });
  const leftX = useTransform(scrollYProgress, [0, 0.75], ["-17vw", "-2vw"]);
  const rightX = useTransform(scrollYProgress, [0, 0.75], ["17vw", "2vw"]);
  const copyOpacity = useTransform(scrollYProgress, [0.32, 0.66], [0, 1]);

  return (
    <section id="perspective">
      <div id="between" ref={betweenRef} className="relative h-[190svh] scroll-mt-16">
        <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden bg-paper">
          <div className="relative flex w-full items-center justify-center" aria-label="之间 — between">
            <motion.span
              aria-hidden="true"
              style={{ x: reduceMotion ? 0 : leftX }}
              className="select-none text-[clamp(13rem,40vw,40rem)] font-medium leading-[0.65] tracking-[-0.12em]"
            >
              {siteContent.between.leftCharacter}
            </motion.span>
            <motion.span
              aria-hidden="true"
              style={{ x: reduceMotion ? 0 : rightX }}
              className="select-none text-[clamp(13rem,40vw,40rem)] font-medium leading-[0.65] tracking-[-0.12em]"
            >
              {siteContent.between.rightCharacter}
            </motion.span>
          </div>
          <motion.div
            style={{ opacity: reduceMotion ? 1 : copyOpacity }}
            className="absolute inset-x-0 bottom-[9vh] text-center"
          >
            <p className="eyebrow text-accent">{siteContent.between.label}</p>
            <p className="mt-3 text-[clamp(1.25rem,2.2vw,2.3rem)] font-medium tracking-[-0.045em]">
              {siteContent.between.statement}
            </p>
          </motion.div>
        </div>
      </div>

      <div id="experience" className="page-shell flex min-h-[125svh] scroll-mt-20 flex-col justify-center py-32 sm:py-48">
        <Reveal>
          <p className="eyebrow text-stone">{siteContent.experience.label}</p>
          <h2 className="display-tight mt-10 whitespace-nowrap text-[12vw] font-semibold sm:text-[clamp(4.2rem,14vw,14.5rem)]">
            {siteContent.experience.company}
          </h2>
        </Reveal>

        <div className="mt-28 grid gap-20 border-t border-line pt-8 sm:mt-40 md:grid-cols-12 md:gap-6">
          <Reveal className="md:col-span-5 md:col-start-2">
            <p className="text-[clamp(6rem,14vw,14rem)] font-medium leading-[0.78] tracking-[-0.08em]">
              {siteContent.experience.metric}
            </p>
            <p className="mt-7 text-xl tracking-[-0.035em] text-charcoal sm:text-2xl">
              {siteContent.experience.metricLabel}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-4 md:col-start-9 md:self-end">
            <ul className="divide-y divide-line border-t border-line">
              {siteContent.experience.sectors.map((sector) => (
                <li key={sector} className="py-4 text-lg font-medium tracking-[-0.03em] sm:text-xl">
                  {sector}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
