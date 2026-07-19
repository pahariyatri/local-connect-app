"use client";

import React from "react";
import Link from "next/link";
import Typography from "../../../components/atoms/Typography";
import Button from "../../../components/atoms/Button";
import Loading from "@/app/loading";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

export default function Confirmation() {
    const { lang, dict, loading } = useLocalizationContext();

    if (loading || !dict) return <Loading />;

    const conf = dict.page.vendor_onboarding.confirmation;

  return (
    <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-1000">
      <div className="relative inline-block mb-10">
        <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_30px_60px_-10px_rgba(16,185,129,0.4)] rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xl animate-bounce">🎊</div>
      </div>
      
      <Typography variant="h1" className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">
        {conf.title}
      </Typography>
      
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] leading-relaxed mb-12 max-w-xs mx-auto">
        {conf.subtitle}
      </p>

      <div className="space-y-6 mb-14 text-left bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100 relative overflow-hidden group hover:bg-white hover:shadow-2xl transition-all duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
        
        <div className="flex items-start gap-5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-emerald-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{conf.pipeline.step1.title}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{conf.pipeline.step1.sub}</p>
            </div>
        </div>
        
        <div className="w-0.5 h-10 bg-emerald-100 ml-[15px] -my-2" />

        <div className="flex items-start gap-5 relative z-10">
            <div className="w-8 h-8 rounded-xl border-2 border-emerald-500 bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{conf.pipeline.step2.title}</p>
                <p className="text-[10px] font-bold text-emerald-500 mt-1 italic">{conf.pipeline.step2.sub}</p>
            </div>
        </div>

        <div className="w-0.5 h-10 bg-slate-100 ml-[15px] -my-2" />

        <div className="flex items-start gap-5 opacity-40 relative z-10">
            <div className="w-8 h-8 rounded-xl border-2 border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-black text-slate-300">3</span>
            </div>
            <div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">{conf.pipeline.step3.title}</p>
                <p className="text-[10px] font-bold text-slate-300 mt-1">{conf.pipeline.step3.sub}</p>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        <Link href={`/${lang}/vendor/dashboard`} className="block">
            <Button className="w-full h-18 py-6 rounded-3xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all group">
                {conf.cta} <span className="ml-2 group-hover:translate-x-2 transition-transform inline-block">🚀</span>
            </Button>
        </Link>
        
        <div className="p-6 rounded-2xl bg-emerald-50/30 border border-emerald-50 flex items-center justify-center gap-3">
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {conf.support} <a href="#" className="text-emerald-500 hover:underline">{conf.contact}</a>
            </p>
        </div>
      </div>
    </div>
  );
}
