import Link from "next/link";
import { AnalyticsLink } from "./analytics-link";

export function DeskHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/[0.07] bg-paper/[0.78] backdrop-blur-2xl">
      <div className="page-shell py-4 sm:flex sm:h-[4.5rem] sm:items-center sm:justify-between sm:py-0">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-[0.72rem] font-semibold tracking-[-0.02em]">YF</Link>
          <span className="eyebrow sm:ml-8">China Desk</span>
          <Link href="/" className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-stone sm:hidden">Back to Yifan.world</Link>
        </div>
        <nav aria-label="China Desk navigation" className="mt-4 sm:mt-0">
          <ul className="flex items-center justify-between gap-4 sm:justify-end sm:gap-7">
            <li><a href="#how-it-works" className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-charcoal hover:text-accent">How it works</a></li>
            <li><AnalyticsLink eventName="Dashboard demo viewed" eventLocation="desk-nav" href="/desk/demo" className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-charcoal hover:text-accent">Dashboard</AnalyticsLink></li>
            <li><a href="#access" className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-charcoal hover:text-accent">Access</a></li>
            <li className="hidden sm:block"><Link href="/" className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-stone hover:text-accent">Back to Yifan.world</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
