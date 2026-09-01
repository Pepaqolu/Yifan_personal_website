"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

const trackedSections = ["experience", "advisory", "becoming", "contact"] as const;

export function EngagementAnalytics() {
  useEffect(() => {
    const reached = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || reached.has(entry.target.id)) return;
          reached.add(entry.target.id);
          track("Section Reached", { section: entry.target.id });
        });
      },
      { threshold: 0.2 },
    );

    trackedSections.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
