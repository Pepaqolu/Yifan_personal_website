"use client";

import { track } from "@vercel/analytics";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function TrackedSubmit({ eventName, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { eventName: string; children: ReactNode }) {
  return <button {...props} type="submit" onClick={(event)=>{ track(eventName); props.onClick?.(event); }}>{children}</button>;
}
