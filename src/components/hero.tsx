"use client";

import { motion, useReducedMotion } from "motion/react";
import { siteContent } from "@/content/site";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const enter = (delay: number, y = 32) => ({
    initial: reduceMotion ? false : { opacity: 0, y },
    animate: reduceMotion ? undefined : { opacity: 1, y: 0 },
    transition: { duration: 1.4, delay, ease },
  });

  return (
    <section id="top" className="min-h-[100svh]">
      <div className="page-shell flex min-h-[100svh] flex-col justify-between pb-8 pt-24 sm:pb-10 sm:pt-28">
        <motion.h1
          {...enter(0.05, 20)}
          className="display-tight whitespace-nowrap text-[clamp(4.2rem,15.8vw,16.5rem)] font-semibold"
        >
          {siteContent.hero.name}
        </motion.h1>

        <div className="my-[12vh] self-end text-right sm:my-[8vh]">
          <motion.p {...enter(0.22)} className="text-[clamp(2rem,5.4vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.06em]">
            {siteContent.hero.lineOne}
          </motion.p>
          <motion.p {...enter(0.35)} className="mt-2 text-[clamp(2rem,5.4vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.06em] text-stone sm:mt-3">
            {siteContent.hero.lineTwo}
          </motion.p>
        </div>

        <motion.div {...enter(0.52, 14)} className="flex items-end justify-end border-t border-line pt-4">
          <p className="text-[clamp(1.3rem,2.5vw,2.6rem)] font-medium tracking-[-0.055em]">
            {siteContent.hero.axis}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
