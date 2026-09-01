"use client";

import type { MotionValue } from "motion/react";
import { useMotionValueEvent } from "motion/react";
import { useState } from "react";

type ScrollProgressDebugProps = {
  label: string;
  progress: MotionValue<number>;
};

export function ScrollProgressDebug({ label, progress }: ScrollProgressDebugProps) {
  const [value, setValue] = useState(0);
  useMotionValueEvent(progress, "change", (latest) => setValue(latest));

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <output className="absolute bottom-3 left-3 z-[60] bg-ink px-2 py-1 font-mono text-[0.6rem] tracking-wide text-paper/80">
      {label} progress: {value.toFixed(2)}
    </output>
  );
}
