import React from "react";
import { Icon } from "@/app/[lang]/components/atoms/Icon";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  /** Already-localized "Step N of M" text (dict.page.builder.step_of) — rendered as-is, not built here, so this stays in the one existing i18n system rather than hardcoding English. */
  label: string;
  className?: string;
}

/**
 * Lightweight CSS/SVG step progress — replaces the removed JourneyProgress
 * (6 crossfading SVG mountain scenes, ~250 lines) with the same
 * dots-and-track pattern already proven live in vendor onboarding and
 * service creation (see app/[lang]/vendor/onboarding/page.tsx,
 * vendor/services/new/page.tsx). No JS animation loop — CSS `transition`
 * only, so it inherits the sitewide `prefers-reduced-motion` override in
 * globals.css automatically, same as those pages.
 */
export default function StepProgress({ currentStep, totalSteps, label, className = "" }: StepProgressProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div
      className={className}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuetext={label}
    >
      <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-2.5">{label}</p>

      <div className="flex items-center">
        {steps.map((step) => {
          const isDone = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <React.Fragment key={step}>
              <div
                className={`shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors duration-300 ${
                  isDone
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-white text-emerald-600 ring-2 ring-emerald-600"
                      : "bg-slate-200 text-slate-400"
                }`}
              >
                {isDone ? <Icon name="check" className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : step}
              </div>
              {step < totalSteps && (
                <div
                  className={`h-1 flex-1 mx-1 sm:mx-1.5 rounded-full transition-colors duration-300 ${
                    isDone ? "bg-emerald-600" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
