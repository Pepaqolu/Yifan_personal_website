"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { productConfig } from "@/config/productConfig";
import { AnalyticsLink } from "./analytics-link";
import { AnnouncementTeaser } from "./announcement-teaser";

export function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 48));

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <AnnouncementTeaser />
      <div className={`border-b transition-[background-color,border-color,backdrop-filter] duration-1000 ${scrolled ? "border-ink/[0.07] bg-paper/[0.72] backdrop-blur-2xl" : "border-transparent bg-transparent"}`}>
        <div className="page-shell flex h-16 items-center justify-between sm:h-[4.5rem]">
          <a href="#top" className="flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.07em]" aria-label={`${productConfig.name}, back to top`}>
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_rgba(145,213,255,0.45)]" />{productConfig.shortName.toUpperCase()}
          </a>
          <nav aria-label="Primary navigation">
            <ul className="flex items-center gap-4 sm:gap-7">
              {[{label:"Product",href:"#product"},{label:"How it works",href:"#how"},{label:"Demo",href:productConfig.routes.demo},{label:"Sign in",href:productConfig.routes.login}].map((item, index) => (
                <li key={item.href} className={index < 2 ? "hidden sm:block" : undefined}>
                  {item.label === "Demo" ? (
                    <AnalyticsLink eventName="demo_clicked" eventLocation="homepage-nav" href={item.href} className="font-mono text-[0.58rem] uppercase tracking-[0.11em] text-charcoal transition-colors duration-500 hover:text-accent sm:text-[0.65rem]">{item.label}</AnalyticsLink>
                  ) : (
                    <a href={item.href} className="font-mono text-[0.58rem] uppercase tracking-[0.11em] text-charcoal transition-colors duration-500 hover:text-accent sm:text-[0.65rem]">{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
