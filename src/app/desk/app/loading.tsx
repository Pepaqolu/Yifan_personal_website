export default function Loading() {
  return <div aria-live="polite" aria-label="Loading Meridian workspace" className="animate-pulse"><div className="h-2.5 w-24 rounded-full bg-accent/20" /><div className="mt-8 h-20 max-w-2xl rounded-2xl bg-ink/[0.07]" /><div className="mt-16 grid gap-4 sm:grid-cols-3"><div className="h-40 rounded-2xl border border-line bg-elevated"/><div className="h-40 rounded-2xl border border-line bg-elevated"/><div className="h-40 rounded-2xl border border-line bg-elevated"/></div></div>;
}
