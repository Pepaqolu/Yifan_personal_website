"use client";

import { track } from "@vercel/analytics";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type AnalyticsLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  eventName: string;
  eventLocation?: string;
};

export function AnalyticsLink({ children, eventName, eventLocation, onClick, ...props }: AnalyticsLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        track(eventName, eventLocation ? { location: eventLocation } : undefined);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
