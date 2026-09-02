"use client";

import { track } from "@vercel/analytics";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function HomepageAnalyzer({ eventName, compact = false }: { eventName: "hero_analyze_started" | "final_analyze_clicked"; compact?: boolean }) {
  const router = useRouter();
  const [website, setWebsite] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = website.trim();
    if (!value) return;
    track(eventName, { location: compact ? "homepage-final" : "homepage-hero" });
    router.push(`/analyze?website=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={submit} className={`flex w-full overflow-hidden border border-line-strong bg-elevated shadow-[var(--shadow-elevated)] focus-within:border-accent/55 ${compact ? "max-w-3xl" : "max-w-2xl"}`}>
      <label className="sr-only" htmlFor={`${eventName}-website`}>Company or product URL</label>
      <input
        id={`${eventName}-website`}
        value={website}
        onChange={(event) => setWebsite(event.target.value.slice(0, 500))}
        inputMode="url"
        autoComplete="url"
        required
        placeholder="Paste your company or product URL"
        className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm outline-none placeholder:text-stone sm:px-5 sm:text-base"
      />
      <button type="submit" aria-label="Analyze my China opportunity" className="shrink-0 bg-accent px-4 text-xs font-semibold text-[#071018] transition-colors hover:bg-ice-bright sm:px-6 sm:text-sm">
        <span className="hidden sm:inline">Analyze my China opportunity </span>→
      </button>
    </form>
  );
}
