"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { siteContent } from "@/content/site";
import { Reveal } from "./reveal";
import { ScrollProgressDebug } from "./scroll-progress-debug";

export function Services() {
  const bridgeRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: bridgeRef, offset: ["start start", "end end"] });
  const chinaX = useTransform(scrollYProgress, [0, 0.15, 0.35, 1], ["0vw", "0vw", "4vw", "4vw"]);
  const worldX = useTransform(scrollYProgress, [0, 0.15, 0.35, 1], ["0vw", "0vw", "-4vw", "-4vw"]);
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.48, 0.58, 1], [0, 0, 1, 1]);
  const arrowScale = useTransform(scrollYProgress, [0.48, 0.58], [0.92, 1]);
  const chineseOpacity = useTransform(scrollYProgress, [0, 0.7, 0.78, 1], [0, 0, 1, 1]);
  const translationOpacity = useTransform(scrollYProgress, [0, 0.78, 0.86, 1], [0, 0, 1, 1]);
  const languageY = useTransform(scrollYProgress, [0.7, 0.86], [20, 0]);
  const messageOpacity = useTransform(scrollYProgress, [0, 0.86, 0.92, 0.98, 1], [0, 0, 1, 1, 0.9]);
  const messageY = useTransform(scrollYProgress, [0.86, 0.92], [20, 0]);

  return (
    <section id="advisory" className="bg-dark text-paper">
      <div ref={bridgeRef} className="relative h-[250svh] scroll-mt-16 sm:h-[285svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-between px-[5vw]" aria-hidden="true">
            <motion.span style={{ x: reduceMotion ? 0 : chinaX }} className="text-[clamp(3rem,12vw,12rem)] font-semibold tracking-[-0.075em]">{siteContent.bridge.china}</motion.span>
            <motion.span style={{ x: reduceMotion ? 0 : worldX }} className="text-[clamp(3rem,12vw,12rem)] font-semibold tracking-[-0.075em]">{siteContent.bridge.world}</motion.span>
          </div>
          <motion.span style={{ opacity: reduceMotion ? 1 : arrowOpacity, scale: reduceMotion ? 1 : arrowScale }} aria-hidden="true" className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(2.5rem,6vw,6rem)] font-medium tracking-[-0.06em]">↔</motion.span>
          <p className="sr-only">{siteContent.bridge.joined}</p>
          <motion.div style={{ y: reduceMotion ? 0 : languageY }} className="absolute inset-x-0 top-[64%] px-5 text-center">
            <motion.p style={{ opacity: reduceMotion ? 1 : chineseOpacity }} className="text-[clamp(2rem,5vw,5rem)] font-medium tracking-[-0.055em]">{siteContent.bridge.chinese}</motion.p>
            <motion.p style={{ opacity: reduceMotion ? 1 : translationOpacity }} className="mt-3 text-base tracking-[-0.025em] text-paper/50 sm:mt-5 sm:text-xl">{siteContent.bridge.translation}</motion.p>
          </motion.div>
          <motion.p style={{ opacity: reduceMotion ? 1 : messageOpacity, y: reduceMotion ? 0 : messageY }} className="absolute inset-x-0 bottom-[8vh] mx-auto max-w-2xl px-6 text-center text-lg leading-[1.55] tracking-[-0.03em] text-paper/68 sm:text-2xl">{siteContent.bridge.message}</motion.p>
          <ScrollProgressDebug label="CHINA" progress={scrollYProgress} />
        </div>
      </div>

      <div className="page-shell py-36 sm:py-56 lg:py-60">
        <Reveal>
          <h2 className="max-w-[10ch] text-[clamp(4.5rem,11vw,11rem)] font-medium leading-[0.84] tracking-[-0.075em]">{siteContent.advisory.title}</h2>
          <p className="mt-16 max-w-2xl text-lg leading-[1.6] tracking-[-0.025em] text-paper/58 sm:mt-24 sm:text-2xl">{siteContent.advisory.audience}</p>
        </Reveal>
        <div className="mt-28 border-t border-paper/15 sm:mt-44">
          {siteContent.advisory.services.map((service, index) => (
            <Reveal key={service.number} delay={index * 0.035} className="grid gap-4 border-b border-paper/15 py-8 sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:py-10">
              <span className="font-mono text-[0.65rem] tracking-[0.12em] text-paper/32 sm:col-span-1">{service.number}</span>
              <h3 className="text-[clamp(2rem,4.2vw,4.2rem)] font-medium leading-none tracking-[-0.055em] sm:col-span-6">{service.title}</h3>
              <p className="max-w-md text-sm leading-[1.6] text-paper/48 sm:col-span-4 sm:col-start-9 sm:text-base">{service.description}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-20 sm:mt-28">
          <a href="#contact" className="group inline-flex items-center gap-4 text-base font-medium tracking-[-0.025em] sm:text-lg">
            <span className="border-b border-paper/25 pb-1.5 transition-colors duration-700 group-hover:border-accent">Tell me what you&apos;re exploring</span>
            <span aria-hidden="true" className="text-accent transition-transform duration-700 group-hover:translate-x-1">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
