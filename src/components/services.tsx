"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { siteContent } from "@/content/site";
import { Reveal } from "./reveal";

export function Services() {
  const bridgeRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: bridgeRef,
    offset: ["start start", "end end"],
  });

  const chinaX = useTransform(scrollYProgress, [0.05, 0.45], ["0vw", "18vw"]);
  const worldX = useTransform(scrollYProgress, [0.05, 0.45], ["0vw", "-18vw"]);
  const splitOpacity = useTransform(scrollYProgress, [0.36, 0.46], [1, 0]);
  const joinedOpacity = useTransform(scrollYProgress, [0.49, 0.62, 0.72], [0, 1, 0.22]);
  const languageOpacity = useTransform(scrollYProgress, [0.61, 0.73], [0, 1]);
  const languageY = useTransform(scrollYProgress, [0.61, 0.76], [36, 0]);
  const messageOpacity = useTransform(scrollYProgress, [0.78, 0.9], [0, 1]);
  const messageY = useTransform(scrollYProgress, [0.78, 0.92], [34, 0]);

  return (
    <section id="advisory" className="bg-ink text-paper">
      <div ref={bridgeRef} className="relative h-[320svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <motion.div
            style={{ opacity: reduceMotion ? 0 : splitOpacity }}
            className="absolute inset-0 flex items-center justify-between px-[5vw]"
            aria-hidden="true"
          >
            <motion.span style={{ x: reduceMotion ? 0 : chinaX }} className="text-[clamp(3rem,12vw,12rem)] font-semibold tracking-[-0.075em]">
              {siteContent.bridge.china}
            </motion.span>
            <motion.span style={{ x: reduceMotion ? 0 : worldX }} className="text-[clamp(3rem,12vw,12rem)] font-semibold tracking-[-0.075em]">
              {siteContent.bridge.world}
            </motion.span>
          </motion.div>

          <motion.p
            style={{ opacity: reduceMotion ? 1 : joinedOpacity }}
            className="absolute inset-x-0 top-[43%] whitespace-nowrap text-center text-[clamp(3.1rem,11vw,11rem)] font-semibold leading-none tracking-[-0.075em]"
          >
            {siteContent.bridge.joined}
          </motion.p>

          <motion.div
            style={{ opacity: reduceMotion ? 1 : languageOpacity, y: reduceMotion ? 0 : languageY }}
            className="absolute inset-x-0 top-[63%] px-5 text-center"
          >
            <p className="text-[clamp(1.8rem,4.8vw,4.8rem)] font-medium tracking-[-0.055em]">
              {siteContent.bridge.chinese}
            </p>
            <p className="mt-3 text-base tracking-[-0.025em] text-paper/55 sm:mt-5 sm:text-xl">
              {siteContent.bridge.translation}
            </p>
          </motion.div>

          <motion.p
            style={{ opacity: reduceMotion ? 1 : messageOpacity, y: reduceMotion ? 0 : messageY }}
            className="absolute inset-x-0 bottom-[8vh] mx-auto max-w-2xl px-6 text-center text-lg leading-[1.5] tracking-[-0.03em] text-paper/72 sm:text-2xl"
          >
            {siteContent.bridge.message}
          </motion.p>
        </div>
      </div>

      <div className="page-shell min-h-[150svh] py-32 sm:py-48 lg:py-60">
        <Reveal>
          <h2 className="max-w-[10ch] text-[clamp(4rem,10.5vw,11rem)] font-medium leading-[0.87] tracking-[-0.075em]">
            {siteContent.advisory.title}
          </h2>
        </Reveal>
        <div className="mt-28 border-t border-paper/20 sm:mt-40">
          {siteContent.advisory.services.map((service, index) => (
            <Reveal key={service.number} delay={index * 0.04} className="grid gap-4 border-b border-paper/20 py-7 sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:py-9">
              <span className="font-mono text-[0.65rem] tracking-[0.12em] text-paper/35 sm:col-span-1">{service.number}</span>
              <h3 className="text-[clamp(1.9rem,4vw,4rem)] font-medium leading-none tracking-[-0.055em] sm:col-span-6">
                {service.title}
              </h3>
              <p className="max-w-md text-sm leading-[1.55] text-paper/50 sm:col-span-4 sm:col-start-9 sm:text-base">
                {service.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
