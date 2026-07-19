"use client";

import React from "react";
import Typography from "../components/atoms/Typography";
import TopNavigation from "../components/organisms/TopNavigation";

import { useLocalizationContext } from "@/contexts/LocalizationContext";

export default function TermsConditionsPage() {
    const { dict, loading } = useLocalizationContext();

    if (!dict) return <div className="min-h-screen bg-slate-50" />;
    const res = dict.page.terms;

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <TopNavigation title={res.title} />

            <main className="max-w-md mx-auto px-6 pt-24">
                <header className="mb-10 text-center">
                    <Typography variant="h1" className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                        {res.title.split('&')[0]}<span className="text-emerald-500">& {res.title.split('&')[1]}</span>
                    </Typography>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{res.subtitle}</p>
                </header>

                <div className="space-y-8">
                    {res.sections.map((section: any, idx: number) => (
                        <section key={idx} className="glass p-8 rounded-[2.5rem] bg-white/80 border-white/60">
                            <Typography variant="h2" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">{section.title}</Typography>
                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                {section.text}
                            </p>
                        </section>
                    ))}
                </div>

                <div className="mt-12 text-center opacity-40">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{res.footer}</p>
                </div>
            </main>
        </div>
    );
}
