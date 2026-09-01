"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { siteContent } from "@/content/site";

export function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 48));

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-700 ${
        scrolled
          ? "border-ink/[0.07] bg-paper/75 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="page-shell flex h-16 items-center justify-between sm:h-[4.5rem]">
        <a href="#top" className="text-[0.72rem] font-semibold tracking-[-0.02em]" aria-label="Yifan Fu, back to top">
          YF
        </a>
        <nav aria-label="Primary navigation">
          <ul className="flex items-center gap-4 sm:gap-7">
            {siteContent.navigation.map((item) => (
              <li key={item.href} className={item.href === "#experience" ? "hidden sm:block" : ""}>
                <a href={item.href} className="font-mono text-[0.6rem] uppercase tracking-[0.11em] text-charcoal transition-colors duration-500 hover:text-accent sm:text-[0.65rem]">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </motion.header>
  );
}
