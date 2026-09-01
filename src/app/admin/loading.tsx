export default function Loading() {
  return (
    <div aria-live="polite" className="animate-pulse">
      <div className="h-3 w-24 bg-ink/10" />
      <div className="mt-8 h-20 max-w-2xl bg-ink/[0.06]" />
      <div className="mt-16 h-px bg-line" />
      <div className="mt-8 h-48 bg-ink/[0.04]" />
    </div>
  );
}
