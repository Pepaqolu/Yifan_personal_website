"use client";

import { track } from "@vercel/analytics";
import { useState } from "react";

export function SnapshotShareButton() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(window.location.href);
    track("analysis_shared");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return <button type="button" onClick={copy} className="rounded-xl border border-line-strong bg-elevated px-4 py-2.5 text-sm text-charcoal transition-colors hover:border-accent/40 hover:text-accent">{copied ? "Private link copied" : "Copy share link"} →</button>;
}
