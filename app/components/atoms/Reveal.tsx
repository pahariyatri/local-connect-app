"use client";
import { useEffect, useRef } from "react";

/** Progressive enhancement: content remains visible without JS or motion support. */
export default function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (!preference.matches && typeof el.animate === "function") {
          animations.push(
            el.animate(
              [
                { opacity: 0.3, transform: "translateY(22px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              {
                duration: 650,
                delay: delayMs,
                easing: "cubic-bezier(.2,.7,.2,1)",
                fill: "backwards",
              },
            ),
          );
        }
        io.disconnect();
      },
      { threshold: 0.08 },
    );
    const cancelMotion = () => {
      if (preference.matches) animations.forEach((a) => a.cancel());
    };
    preference.addEventListener("change", cancelMotion);
    io.observe(el);
    return () => {
      io.disconnect();
      animations.forEach((a) => a.cancel());
      preference.removeEventListener("change", cancelMotion);
    };
  }, [delayMs]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
