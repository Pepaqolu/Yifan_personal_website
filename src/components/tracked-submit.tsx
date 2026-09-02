"use client";

import { track } from "@vercel/analytics";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function TrackedSubmit({ eventName, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { eventName: string | string[]; children: ReactNode }) {
  return <button {...props} type="submit" onClick={(event)=>{ (Array.isArray(eventName)?eventName:[eventName]).forEach((name)=>track(name)); props.onClick?.(event); }}>{children}</button>;
}
