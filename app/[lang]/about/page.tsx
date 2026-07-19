"use client";

import React from "react";
import Typography from "../components/atoms/Typography";
import Button from "../components/atoms/Button";
import { useRouter, useParams } from "next/navigation";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

export default function AboutPage() {
    const router = useRouter();
    const { lang: pathLang } = useParams();
    const { dict, lang } = useLocalizationContext();


    if (!dict) return <div className="min-h-screen bg-white"/>;
    const about = dict.page.about;

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* 🏔️ Hero Section */}
            <div className="relative h-[60vh] bg-slate-900 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0 opacity-40 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20">
                </div>
                <div className="relative z-10 text-center px-6">
                    <Typography variant="h1" className="text-5xl font-black text-white leading-tight uppercase tracking-tighter mb-4"
                        dangerouslySetInnerHTML={{ __html: about.hero.title }} />
                    <p className="text-slate-300 text-sm font-bold uppercase tracking-widest max-w-xs mx-auto">
                        {about.hero.subtitle}
                    </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            <main className="max-w-md mx-auto px-6 pt-12">
                <section className="mb-16">
                    <Typography variant="h2" className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">{about.mission.title}</Typography>
                    <p className="text-slate-600 font-medium leading-[1.8] text-sm"
                       dangerouslySetInnerHTML={{ __html: about.mission.text }} />
                </section>


                
                <section className="mb-16">
                    <Typography variant="h2" className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">{about.markets.title}</Typography>
                    
                    <div className="space-y-8">
                        {about.markets.groups.map((group: any, idx: number) => (
                            <div key={idx}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">{group.flags}</span>
                                    <h4 className="font-bold text-slate-800 uppercase tracking-wide text-xs">{group.name}</h4>
                                </div>
                                <p className="text-slate-600 font-medium leading-[1.6] text-xs">
                                    {group.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="space-y-4 mb-20">
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
                        <div className="text-3xl">🏔️</div>
                        <div>
                            <h4 className="font-black text-slate-900 uppercase text-xs">{about.features.local}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{about.features.local_sub}</p>
                        </div>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
                        <div className="text-3xl">🛡️</div>
                        <div>
                            <h4 className="font-black text-slate-900 uppercase text-xs">{about.features.trust}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{about.features.trust_sub}</p>
                        </div>
                    </div>
                </div>

                <div className="p-10 bg-indigo-600 rounded-[3rem] text-center shadow-2xl shadow-indigo-200">
                    <Typography variant="h3" className="text-white font-black uppercase tracking-widest mb-2">{about.cta.title}</Typography>
                    <p className="text-indigo-100 text-[10px] font-bold uppercase mb-8 leading-relaxed">
                        {about.cta.subtitle}
                    </p>
                    <div className="space-y-3">
                        <Button 
                            className="w-full h-14 rounded-2xl bg-white text-indigo-600 font-black text-[10px] uppercase tracking-widest"
                            onClick={() => router.push(`/${lang}/builder`)}
                        >
                            {about.cta.build}
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full text-white/70 font-black text-[9px] uppercase tracking-widest"
                            onClick={() => router.push(`/${lang}/vendor/onboarding`)}
                        >
                            {about.cta.vendor}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
