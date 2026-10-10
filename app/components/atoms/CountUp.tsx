"use client";

import React, { useEffect, useState } from "react";

/** Eases toward the target once per mount — requestAnimationFrame + cubic
 * ease-out, not a linear setInterval tick. Renders the target immediately
 * (no animation) for users with prefers-reduced-motion. */
export default function CountUp({ target, durationMs = 1200, className }: { target: number; durationMs?: number; className?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Safety net: browsers pause/throttle requestAnimationFrame heavily for
    // a backgrounded/hidden tab, which could otherwise leave the count
    // stuck part-way. A plain timer guarantees the real number lands
    // eventually even if the eased animation frames never got to run.
    const fallback = setTimeout(() => setValue(target), durationMs + 150);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
    // Deliberately no "has this already run" ref guard here — that pattern
    // breaks React 18 Strict Mode's dev-only mount→cleanup→remount check:
    // the first invocation's timers get torn down by the interposed
    // cleanup, and a ref guard then blocks the second (surviving)
    // invocation from ever setting up its own, leaving nothing running.
    // A plain effect that tears down and re-sets up cleanly is correct.
  }, [target, durationMs]);

  return <span className={className}>{value}</span>;
}
