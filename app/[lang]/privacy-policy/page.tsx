"use client";

import React from "react";
import Typography from "../components/atoms/Typography";
import TopNavigation from "../components/organisms/TopNavigation";

import { useLocalizationContext } from "@/contexts/LocalizationContext";

export default function PrivacyPolicyPage() {
    const { dict, loading } = useLocalizationContext();

    if (!dict) return <div className="min-h-screen bg-slate-50" />;
    const res = dict.page.privacy;

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <TopNavigation title={res.title} />

            <main className="max-w-md mx-auto px-6 pt-24">
                <header className="mb-10 text-center">
                    <Typography variant="h1" className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                        {res.title.split(' ')[0]} <span className="text-emerald-500">{res.title.split(' ').slice(1).join(' ')}</span>
                    </Typography>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{res.subtitle}</p>
                </header>

                <div className="space-y-8">
                    <section className="glass p-8 rounded-[2.5rem] bg-indigo-900 text-white shadow-2xl">
                        <Typography variant="h2" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">{res.oath_title}</Typography>
                        <p className="text-indigo-100 text-sm font-black leading-snug">
                            {res.oath_text}
                        </p>
                    </section>

                    {res.sections.map((section: any, idx: number) => (
                        <section key={idx} className="glass p-8 rounded-[2.5rem] bg-white border-slate-100">
                            <Typography variant="h2" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">{section.title}</Typography>
                            {section.items ? (
                                <ul className="space-y-3 mt-4">
                                    {section.items.map((item: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-xs font-medium text-slate-600">
                                            <span className="text-emerald-500">✔</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-600 text-xs font-medium leading-relaxed">
                                    {section.text}
                                </p>
                            )}
                        </section>
                    ))}
                </div>

                <div className="mt-12 p-8 rounded-[2.5rem] bg-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{res.footer_q}</p>
                    <p className="text-sm font-black text-slate-900">{res.email}</p>
                </div>
            </main>
        </div>
    );
}
