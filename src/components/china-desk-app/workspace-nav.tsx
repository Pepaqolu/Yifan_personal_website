"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment } from "react";

export function WorkspaceNav({ items }: { items: readonly (readonly [string, string, string?])[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <nav aria-label="Workspace navigation" className="overflow-x-auto">
      <ul className="min-w-0 space-y-1">
        {items.map(([label, href, group]) => {
          const [hrefPath, hrefQuery] = href.split("?");
          const queryMatches = hrefQuery ? hrefQuery.split("&").every((entry)=>{const [key,value]=entry.split("=");return searchParams.get(key)===value;}) : !hrefPath.endsWith("/partners") || !searchParams.has("view");
          const active = (hrefPath.endsWith("/app") || hrefPath === "/admin" ? pathname === hrefPath : pathname.startsWith(hrefPath)) && queryMatches;
          return <Fragment key={href}>{group ? <li aria-hidden="true" className="pb-2 pt-7 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-stone first:pt-0">{group}</li> : null}<li><Link href={href} aria-current={active ? "page" : undefined} className={`relative block rounded-[9px] px-3 py-2.5 text-[0.82rem] transition-[color,background-color] duration-300 ${active ? "bg-accent/[0.08] font-medium text-accent before:absolute before:inset-y-2.5 before:left-0 before:w-px before:bg-accent" : "text-charcoal hover:bg-white/[0.025] hover:text-ink"}`}>{label}</Link></li></Fragment>;
        })}
      </ul>
    </nav>
  );
}
