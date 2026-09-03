import type { ReactNode } from "react";
import { humanize } from "@/lib/china-desk/constants";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="mb-10 border-b border-line pb-7 sm:mb-12"><div className="flex items-center justify-between gap-6"><p className="eyebrow text-stone">{eyebrow}</p>{action}</div><h1 className="mt-5 text-[clamp(2.5rem,5vw,4.75rem)] font-medium leading-[0.92] tracking-[-0.062em]">{title}</h1>{description ? <p className="mt-5 max-w-2xl text-sm leading-6 text-charcoal sm:text-base">{description}</p> : null}</header>;
}

export function Status({ children }: { children: string }) {
  return <span className="inline-flex rounded-md border border-line bg-white/[0.025] px-2 py-1 font-mono text-[0.56rem] uppercase tracking-[0.09em] text-charcoal">{humanize(children)}</span>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?:ReactNode }) {
  return <section className="bubble-card px-6 py-14 sm:px-8"><p className="eyebrow text-stone">READY WHEN YOU ARE</p><p className="mt-5 text-2xl font-medium tracking-[-0.04em]">{title}</p><p className="mt-3 max-w-lg text-sm leading-6 text-charcoal">{description}</p>{action?<div className="mt-7">{action}</div>:null}</section>;
}

export function ErrorState({ message = "Meridian could not load this workspace. Try again, or contact Yifan if the issue continues." }: { message?: string }) {
  return <div role="alert" className="border-l border-accent pl-5 text-sm leading-6 text-stone">{message}</div>;
}

export function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
