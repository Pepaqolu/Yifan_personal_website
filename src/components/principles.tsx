"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { siteContent } from "@/content/site";
import { Reveal } from "./reveal";
import { ScrollProgressDebug } from "./scroll-progress-debug";

export function Principles() {
  const storyRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
  const backgroundColor = useTransform(scrollYProgress, [0, 0.5, 1], ["#f5f5f2", "#eeeeea", "#e3e3de"]);
  const firstOpacity = useTransform(scrollYProgress, [0, 0.25, 0.3, 0.34], [1, 1, 1, 0]);
  const secondOpacity = useTransform(scrollYProgress, [0, 0.3, 0.35, 0.55, 0.6, 1], [0, 0, 1, 1, 0, 0]);
  const thirdOpacity = useTransform(scrollYProgress, [0, 0.58, 0.63, 1], [0, 0, 1, 1]);
  const firstY = useTransform(scrollYProgress, [0.3, 0.34], [0, -20]);
  const secondY = useTransform(scrollYProgress, [0.3, 0.35, 0.55, 0.6], [20, 0, 0, -20]);
  const thirdY = useTransform(scrollYProgress, [0.58, 0.63], [20, 0]);

  return (
    <section id="becoming">
      {reduceMotion ? (
        <div className="bg-paper">
          {siteContent.becoming.map((line, index) => (
            <div key={line} className="page-shell flex min-h-[100svh] items-center py-32">
              <p className={`text-[clamp(4rem,11vw,11rem)] font-medium leading-[0.84] tracking-[-0.075em] ${index === 1 ? "text-charcoal" : index === 2 ? "text-stone" : ""}`}>{line}</p>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="bg-paper md:hidden">
            {siteContent.becoming.map((line, index) => (
              <div key={line} className={`page-shell flex items-center py-24 ${index === 2 ? "min-h-[120svh]" : "min-h-[100svh]"}`}>
                <p className={`text-[clamp(4rem,18vw,6.5rem)] font-medium leading-[0.84] tracking-[-0.075em] ${index === 1 ? "text-charcoal" : index === 2 ? "text-stone" : ""}`}>{line}</p>
              </div>
            ))}
          </div>
          <motion.div ref={storyRef} style={{ backgroundColor }} className="relative hidden h-[340svh] md:block">
            <div className="sticky top-0 h-[100svh] overflow-hidden">
              {[firstOpacity, secondOpacity, thirdOpacity].map((opacity, index) => {
                const y = [firstY, secondY, thirdY][index];
                return (
                  <motion.div key={siteContent.becoming[index]} style={{ opacity, y }} className="page-shell absolute inset-0 flex items-center">
                    <p className={`text-[clamp(4rem,11vw,11rem)] font-medium leading-[0.84] tracking-[-0.075em] ${index === 1 ? "text-charcoal" : index === 2 ? "text-stone" : ""}`}>{siteContent.becoming[index]}</p>
                  </motion.div>
                );
              })}
              <ScrollProgressDebug label="BECOMING" progress={scrollYProgress} />
            </div>
          </motion.div>
        </>
      )}

      <div className="bg-paper">
        <div className="page-shell py-36 sm:py-56">
          <Reveal>
            <p className="max-w-[17ch] text-[clamp(2.8rem,6.6vw,6.6rem)] font-medium leading-[0.94] tracking-[-0.068em]">{siteContent.perspective.statement}</p>
          </Reveal>
          <div className="mt-28 border-t border-line sm:mt-40">
            {siteContent.perspective.interests.map((interest) => (
              <Reveal key={interest} className="border-b border-line py-4 sm:py-5">
                <p className="text-[clamp(1.5rem,3.2vw,3.2rem)] font-medium tracking-[-0.05em]">{interest}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
