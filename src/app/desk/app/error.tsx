"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <section className="py-20"><p className="eyebrow text-accent">WORKSPACE ERROR</p><h1 className="mt-8 text-5xl font-medium tracking-[-0.06em]">This view could not be loaded.</h1><button onClick={reset} className="mt-10 border-b border-ink/25 pb-1 text-sm">Try again →</button></section>;
}
