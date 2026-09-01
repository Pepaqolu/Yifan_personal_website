import type { ReactNode } from "react";
import { humanize } from "@/lib/china-desk/constants";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="mb-12 border-b border-line pb-8 sm:mb-16"><div className="flex items-center justify-between gap-6"><p className="eyebrow text-stone">{eyebrow}</p>{action}</div><h1 className="mt-6 text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.9] tracking-[-0.068em]">{title}</h1>{description ? <p className="mt-6 max-w-2xl text-base leading-7 text-stone sm:text-lg">{description}</p> : null}</header>;
}

export function Status({ children }: { children: string }) {
  return <span className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-stone">{humanize(children)}</span>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <section className="border-y border-line py-16"><p className="text-2xl font-medium tracking-[-0.04em]">{title}</p><p className="mt-3 max-w-lg text-sm leading-6 text-stone">{description}</p></section>;
}

export function ErrorState({ message = "China Desk could not load this workspace. Try again, or contact Yifan if the issue continues." }: { message?: string }) {
  return <div role="alert" className="border-l border-accent pl-5 text-sm leading-6 text-stone">{message}</div>;
}

export function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
