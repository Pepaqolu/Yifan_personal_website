"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { siteContent } from "@/content/site";
import { Reveal } from "./reveal";

export function Principles() {
  const storyRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
  const backgroundColor = useTransform(scrollYProgress, [0, 0.5, 1], ["#f5f5f2", "#eeeeea", "#e3e3de"]);
  const firstOpacity = useTransform(scrollYProgress, [0, 0.24, 0.36], [1, 1, 0]);
  const secondOpacity = useTransform(scrollYProgress, [0.27, 0.43, 0.63, 0.72], [0, 1, 1, 0]);
  const thirdOpacity = useTransform(scrollYProgress, [0.64, 0.78, 1], [0, 1, 1]);
  const firstY = useTransform(scrollYProgress, [0, 0.36], [0, -32]);
  const secondY = useTransform(scrollYProgress, [0.27, 0.5, 0.72], [32, 0, -32]);
  const thirdY = useTransform(scrollYProgress, [0.64, 0.88], [32, 0]);

  return (
    <section>
      {reduceMotion ? (
        <div className="bg-paper">
          {siteContent.becoming.map((line, index) => (
            <div key={line} className="page-shell flex min-h-[100svh] items-center py-32">
              <p className={`text-[clamp(4rem,11vw,11rem)] font-medium leading-[0.84] tracking-[-0.075em] ${index === 1 ? "text-charcoal" : index === 2 ? "text-stone" : ""}`}>{line}</p>
            </div>
          ))}
        </div>
      ) : (
        <motion.div ref={storyRef} style={{ backgroundColor }} className="relative h-[300svh]">
          <div className="sticky top-0 h-[100svh] overflow-hidden">
            {[firstOpacity, secondOpacity, thirdOpacity].map((opacity, index) => {
              const y = [firstY, secondY, thirdY][index];
              return (
                <motion.div key={siteContent.becoming[index]} style={{ opacity, y }} className="page-shell absolute inset-0 flex items-center">
                  <p className={`text-[clamp(4rem,11vw,11rem)] font-medium leading-[0.84] tracking-[-0.075em] ${index === 1 ? "text-charcoal" : index === 2 ? "text-stone" : ""}`}>{siteContent.becoming[index]}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
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
