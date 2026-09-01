import Link from "next/link";
import type { ReactNode } from "react";
import type { WorkspaceContext } from "@/lib/china-desk/auth";
import { signOut } from "@/app/desk/login/actions";
import { WorkspaceNav } from "./workspace-nav";

export function WorkspaceShell({ context, navigation, label, children }: { context: WorkspaceContext; navigation: readonly (readonly [string, string])[]; label: string; children: ReactNode }) {
  const displayName = [context.profile.first_name, context.profile.last_name].filter(Boolean).join(" ") || context.user.email || "Member";
  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-paper px-7 py-8 lg:flex lg:flex-col">
        <div><Link href="/desk" className="eyebrow">CHINA DESK</Link><p className="mt-3 text-xs text-stone">{label}</p></div>
        <div className="mt-14"><WorkspaceNav items={navigation} /></div>
        <div className="mt-auto border-t border-line pt-5"><p className="text-sm font-medium">{displayName}</p><p className="mt-1 text-xs text-stone">{context.organization?.name ?? "Administration"}</p><form action={signOut}><button className="mt-4 text-xs text-stone hover:text-ink">Sign out →</button></form></div>
      </aside>
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 px-5 py-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between"><Link href="/desk" className="eyebrow">CHINA DESK</Link><form action={signOut}><button className="text-xs text-stone">Sign out</button></form></div>
        <div className="mt-3 border-t border-line pt-2"><WorkspaceNav items={navigation} /></div>
      </header>
      <main className="px-5 py-10 sm:px-8 sm:py-14 lg:ml-64 lg:px-12 xl:px-16"><div className="mx-auto max-w-[92rem]">{children}</div></main>
    </div>
  );
}
