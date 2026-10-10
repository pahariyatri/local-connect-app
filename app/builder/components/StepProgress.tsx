"use client";

import { useEffect, useRef } from "react";
import styles from "./StepProgress.module.css";

const STEPS = ["Route", "Dates", "People", "Services", "Stops", "Plan"];

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  label: string;
  className?: string;
}

export default function StepProgress({ currentStep, totalSteps, label, className = "" }: StepProgressProps) {
  const panelRef = useRef<HTMLElement>(null);
  const completed = currentStep - 1;
  const current = STEPS[completed];

  useEffect(() => {
    const header = document.querySelector("[data-site-header]");
    if (!header) return;
    const updateOffset = () => panelRef.current?.style.setProperty("--header-height", `${header.getBoundingClientRect().height}px`);
    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={panelRef} className={`${styles.panel} ${className}`} aria-label="Your trip progress">
      <p className="sr-only" aria-live="polite" aria-atomic="true">{label}: {current}</p>
      <ol className={styles.steps} aria-label="Planning stages">
        {STEPS.slice(0, totalSteps).map((step, index) => (
          <li key={step} aria-current={index === completed ? "step" : undefined}
            className={index < completed ? styles.done : index === completed ? styles.active : undefined}>
            <span>{step}</span>
            <span className="sr-only">{index < completed ? ", completed" : index === completed ? ", current step" : ", upcoming"}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
