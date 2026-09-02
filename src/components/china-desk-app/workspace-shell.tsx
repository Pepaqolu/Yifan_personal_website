import Link from "next/link";
import type { ReactNode } from "react";
import type { WorkspaceContext } from "@/lib/china-desk/auth";
import { signOut } from "@/app/desk/login/actions";
import { WorkspaceNav } from "./workspace-nav";
import { productConfig } from "@/config/productConfig";

export function WorkspaceShell({ context, navigation, label, children }: { context: WorkspaceContext; navigation: readonly (readonly [string, string, string?])[]; label: string; children: ReactNode }) {
  const displayName = [context.profile.first_name, context.profile.last_name].filter(Boolean).join(" ") || context.user.email || "Member";
  return (
    <div className="workspace-shell min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line bg-dark-soft px-6 py-7 lg:flex lg:flex-col">
        <div className="border-b border-line pb-6"><Link href="/" className="flex items-center gap-3 text-[0.72rem] font-semibold tracking-[0.08em]"><span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_rgba(145,213,255,0.42)]"/>{productConfig.shortName.toUpperCase()}</Link><p className="mt-3 font-mono text-[0.56rem] uppercase tracking-[0.12em] text-stone">{label}</p></div>
        <div className="mt-5 overflow-y-auto"><WorkspaceNav items={navigation} /></div>
        <div className="mt-auto border-t border-line pt-5"><div className="flex items-start gap-3"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent"/><div><p className="text-sm font-medium">{displayName}</p><p className="mt-1 text-xs text-stone">{context.organization?.name ?? "Administration"}</p><p className="mt-3 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-stone">China ↔ World</p></div></div><form action={signOut}><button className="mt-5 text-xs text-stone transition-colors hover:text-ink">Sign out →</button></form></div>
      </aside>
      <header className="sticky top-0 z-20 border-b border-line bg-paper/[0.78] px-5 py-4 backdrop-blur-2xl backdrop-saturate-150 lg:hidden">
        <div className="flex items-center justify-between"><Link href="/" className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.08em]"><span className="h-1.5 w-1.5 rounded-full bg-accent"/>{productConfig.shortName.toUpperCase()}</Link><details className="group relative"><summary className="list-none rounded-lg border border-line px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-charcoal">Menu</summary><div className="absolute right-0 top-11 w-[min(19rem,calc(100vw-2.5rem))] rounded-2xl border border-line bg-elevated p-4 shadow-[var(--shadow-elevated)]"><WorkspaceNav items={navigation}/><div className="mt-5 border-t border-line pt-4"><p className="text-xs text-stone">{displayName}</p><form action={signOut}><button className="mt-3 text-xs text-charcoal">Sign out →</button></form></div></div></details></div>
      </header>
      <main className="min-h-screen bg-[radial-gradient(circle_at_60%_0%,rgba(158,215,255,0.025),transparent_26%)] px-5 py-8 sm:px-8 sm:py-12 lg:ml-72 lg:px-12 xl:px-16"><div className="mx-auto max-w-[92rem]">{children}</div></main>
    </div>
  );
}
