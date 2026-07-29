"use client";

import React from "react";

type BackButtonProps = {
  onClick: () => void;
  className?: string;
  label?: string;
};

/**
 * The one back-button style for the whole app (login, PIN, Builder steps,
 * onboarding…). Floating circular arrow — same size and position everywhere
 * so users always know where "back" is.
 */
export default function BackButton({ onClick, className = "", label = "Go back" }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-90 ${className}`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
  );
}
