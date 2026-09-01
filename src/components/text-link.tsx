import type { AnchorHTMLAttributes, ReactNode } from "react";

type TextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode };

export function TextLink({ children, className = "", ...props }: TextLinkProps) {
  return (
    <a className={`group inline-flex items-center gap-3 text-sm font-medium tracking-[-0.01em] ${className}`} {...props}>
      <span className="border-b border-ink/30 pb-1 transition-colors duration-300 group-hover:border-accent">{children}</span>
      <span aria-hidden="true" className="text-accent transition-transform duration-300 group-hover:translate-x-1">↗</span>
    </a>
  );
}
