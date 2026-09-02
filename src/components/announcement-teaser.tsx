"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { productConfig } from "@/config/productConfig";
import { AnalyticsLink } from "./analytics-link";

const DISMISSAL_KEY = "yifan-world-meridian-announcement-v1-dismissed";

export function AnnouncementTeaser() {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        if (window.localStorage.getItem(DISMISSAL_KEY) !== "true") {
          setVisible(true);
        }
      } catch {
        setVisible(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISSAL_KEY, "true");
    } catch {
      // The dismissal still applies for this page view when storage is unavailable.
    }
    setVisible(false);
  };

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.aside
          aria-label={`${productConfig.name} announcement`}
          initial={{ height: 0, opacity: 0, y: reduceMotion ? 0 : -8 }}
          animate={{ height: "auto", opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: reduceMotion ? 0 : -6 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden border-b border-accent/30 bg-accent text-[#071018]"
        >
          <AnalyticsLink
            eventName="analyze_clicked"
            eventLocation="announcement"
            href={productConfig.routes.analyze}
            className="group flex min-h-9 items-center justify-center px-14 py-2 text-center text-[0.75rem] leading-5 tracking-[-0.01em] focus-visible:outline-offset-[-3px] sm:min-h-10 sm:px-20 sm:text-[0.8rem]"
          >
            <span className="sm:hidden">{productConfig.shortName.toUpperCase()} IS LIVE IN PRIVATE BETA</span>
            <span className="hidden sm:inline">
              <span className="font-semibold">{productConfig.shortName.toUpperCase()} IS LIVE IN PRIVATE BETA</span>
              <span className="ml-2 opacity-70">Analyze your China opportunity</span>
            </span>
            <span aria-hidden="true" className="ml-1.5 opacity-70 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">→</span>
          </AnalyticsLink>
          <button
            type="button"
            onClick={dismiss}
            aria-label={`Dismiss ${productConfig.name} announcement`}
            className="absolute inset-y-0 right-1 flex w-10 items-center justify-center text-base font-light opacity-50 transition-opacity duration-300 hover:opacity-100 focus-visible:outline-offset-[-4px] sm:right-4"
          >
            <span aria-hidden="true">×</span>
          </button>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
