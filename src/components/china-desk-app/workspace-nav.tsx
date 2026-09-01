"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function WorkspaceNav({ items }: { items: readonly (readonly [string, string])[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Workspace navigation" className="overflow-x-auto">
      <ul className="flex min-w-max gap-6 lg:block lg:min-w-0 lg:space-y-1 lg:gap-0">
        {items.map(([label, href]) => {
          const active = href.endsWith("/app") || href === "/admin" ? pathname === href : pathname.startsWith(href);
          return <li key={href}><Link href={href} aria-current={active ? "page" : undefined} className={`block py-2 text-sm transition-colors ${active ? "font-medium text-ink" : "text-stone hover:text-ink"}`}>{label}</Link></li>;
        })}
      </ul>
    </nav>
  );
}
