"use client";

import React from "react";
import Button from "@/app/[lang]/components/atoms/Button";
import Typography from "@/app/[lang]/components/atoms/Typography";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { dict, loading } = useLocalizationContext();

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading...</div>;
  }

  const err = dict?.page?.common?.errors || {
    title: "Something went wrong!",
    subtitle: "Oops, something went wrong while processing your request. Please try again later.",
    details: "Error Details:",
    retry: "Try Again"
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center px-8 bg-white text-center space-y-8 animate-in fade-in duration-700">
      <div className="w-24 h-24 rounded-[2rem] bg-red-50 flex items-center justify-center text-4xl mb-4 border border-red-100 shadow-xl shadow-red-50 animate-bounce">
        ⚠️
      </div>
      
      <div>
        <Typography variant="h1" className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">
          {err.title}
        </Typography>

        <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto leading-relaxed">
          {err.subtitle}
        </p>
      </div>

      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 w-full max-w-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{err.details}</p>
        <code className="text-xs text-red-500 font-bold break-all">{error.message}</code>
      </div>

      <Button onClick={reset} className="w-full max-w-xs h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-200 active:scale-95 transition-all">
        {err.retry}
      </Button>
    </div>
  );
}
