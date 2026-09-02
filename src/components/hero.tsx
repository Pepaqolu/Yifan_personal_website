"use client";

import { motion, useReducedMotion } from "motion/react";
import { siteContent } from "@/content/site";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const enter = (delay: number, y = 18, duration = 0.82) => ({
    initial: reduceMotion ? false : { opacity: 0, y },
    animate: reduceMotion ? undefined : { opacity: 1, y: 0 },
    transition: { duration, delay, ease },
  });

  return (
    <section id="top" className="technical-grid min-h-[100svh]">
      <div className="page-shell flex min-h-[100svh] flex-col justify-center pb-10 pt-24 sm:pb-12 sm:pt-28">
        <motion.h1 {...enter(0, 10, 0.72)} className="eyebrow text-stone">
          {siteContent.hero.name}
        </motion.h1>

        <div className="my-[12vh] sm:my-[10vh]">
          <motion.p {...enter(0.24, 18, 0.9)} className="max-w-[10ch] text-[clamp(4.5rem,11.5vw,10rem)] font-medium leading-[0.84] tracking-[-0.075em]">
            {siteContent.hero.lineOne}
          </motion.p>
          <motion.p {...enter(0.6, 16, 0.78)} className="mt-8 max-w-[18ch] text-[clamp(1.75rem,4.5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.06em] text-charcoal sm:mt-12">
            {siteContent.hero.lineTwo}
          </motion.p>
        </div>

        <motion.div {...enter(0.9, 8, 0.6)} className="flex items-end justify-end border-t border-line pt-4">
          <p className="text-sm font-medium tracking-[-0.025em] text-accent sm:text-base">
            {siteContent.hero.axis}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
