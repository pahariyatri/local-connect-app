"use client";

import React, { useEffect } from "react";
import Button from "@/app/[lang]/components/atoms/Button";
import Typography from "@/app/[lang]/components/atoms/Typography";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

/**
 * App Router error boundary — catches any uncaught render/client error
 * anywhere under this locale segment (e.g. the null-coordinate crash found
 * and fixed in vendor/services/new/page.tsx earlier). Two fixes here:
 * 1. The raw `error.message` used to be printed directly to the page for
 *    any visitor to read — a real information-disclosure smell (stack
 *    traces, internal field names, sometimes literal API error text) and
 *    not something a traveler/vendor can act on anyway. Logged to the
 *    console instead (picked up by the browser devtools / any error
 *    monitoring already wired to console.error) and never rendered.
 * 2. Softened the shouty uppercase/tracking-widest voice to match the
 *    calmer re-theme applied elsewhere — this screen is exactly the
 *    moment a user is already frustrated; loud styling doesn't help.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { dict, loading } = useLocalizationContext();

  useEffect(() => {
    console.error("Unhandled render error:", error);
  }, [error]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50 font-medium text-slate-400 animate-pulse">Loading…</div>;
  }

  const err = dict?.page?.common?.errors || {
    title: "Something went wrong",
    subtitle: "We hit a snag loading this page. Please try again — if it keeps happening, our team has already been notified.",
    retry: "Try again"
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center px-8 bg-white text-center space-y-6 animate-in fade-in duration-700">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div>
        <Typography variant="h1" className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          {err.title}
        </Typography>
        <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
          {err.subtitle}
        </p>
      </div>

      <Button onClick={reset} className="w-full max-w-xs h-14 rounded-2xl">
        {err.retry}
      </Button>
    </div>
  );
}
