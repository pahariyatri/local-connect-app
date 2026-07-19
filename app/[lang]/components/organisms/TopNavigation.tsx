"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { Locale } from "@/i18n-config";

interface TopNavigationProps {
    title?: string;
    leftButton?: { label: string; onClick: () => void };
    rightButtons?: { label: string; onClick: () => void }[];
    transparent?: boolean;
    onToggleLanguage?: (lang?: any) => void;
}

export default function TopNavigation({
    title = "Local Connect",
    leftButton,
    rightButtons = [],
    transparent = false,
    onToggleLanguage,
}: TopNavigationProps) {
    const params = useParams();
    const lang = params.lang || "en";

    const { totalCount } = useCart();
    const { user } = useAuth();
    const { dict } = useLocalizationContext();

    const [scrolled, setScrolled] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    const LANGUAGE_CYCLE: Locale[] = ['en', 'hi', 'he', 'fr', 'es', 'de'];
    const LANGUAGE_DETAILS: Record<Locale, { label: string; native: string; flag: string }> = {
        'en': { label: 'English', native: 'English', flag: '🇺🇸' },
        'hi': { label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
        'he': { label: 'Hebrew', native: 'עברית', flag: '🇮🇱' },
        'fr': { label: 'French', native: 'Français', flag: '🇫🇷' },
        'es': { label: 'Spanish', native: 'Español', flag: '🇪🇸' },
        'de': { label: 'German', native: 'Deutsch', flag: '🇩🇪' }
    };

    const handleLanguageSelect = (newLang: Locale) => {
        onToggleLanguage?.(newLang);
        setIsLangOpen(false);
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const actions = dict?.page?.common?.actions;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
            (transparent && !scrolled) 
                ? "bg-transparent" 
                : "bg-white border-b border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.05)]"
        }`}>
            <div className="max-w-7xl mx-auto px-6 sm:px-10">
                <div className="flex justify-between items-center h-20 sm:h-24">
                    <div className="flex items-center gap-6">
                        {leftButton ? (
                            <button 
                                className="flex items-center gap-2 px-3 py-2 rounded-xl group active:scale-95 transition-all" 
                                onClick={leftButton.onClick}
                            >
                                <span className={`text-xl ${(transparent && !scrolled) ? "text-white" : "text-slate-400 group-hover:text-slate-900"}`}>←</span>
                                {title && <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${(transparent && !scrolled) ? "text-white/80" : "text-slate-900"}`}>{title}</span>}
                            </button>
                        ) : (
                            <div className="flex items-center gap-4 group">
                                <Link href={`/${lang}`} className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white text-xs shadow-2xl rotate-[12deg] group-hover:rotate-0 transition-all duration-500 active:scale-90">
                                    LC
                                </Link>
                                <div className="flex flex-col">
                                    <span className={`text-[11px] sm:text-xs font-black uppercase tracking-[0.3em] italic leading-none ${(transparent && !scrolled) ? "text-white" : "text-slate-900"}`}>
                                        {title}
                                    </span>
                                    {(!transparent || scrolled) && (
                                        <div className="w-12 h-1 bg-emerald-500/30 rounded-full mt-2 group-hover:w-full transition-all duration-700" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* 🎒 Journey / Cart Button */}
                        <Link 
                            href={`/${lang}/journey`}
                            className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl sm:rounded-2xl hover:bg-slate-900/5 transition-all group active:scale-90"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`${(transparent && !scrolled) ? "text-white" : "text-slate-400"} group-hover:text-slate-900 transition-colors pointer-events-none sm:w-[22px] sm:h-[22px]`}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                            {totalCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-emerald-500 text-[8px] sm:text-[10px] font-black text-white shadow-xl ring-4 ring-white transition-transform group-hover:scale-110">
                                    {totalCount}
                                </span>
                            )}
                        </Link>

                        {/* 🌐 Language Selector Dropdown */}
                        {onToggleLanguage && (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsLangOpen(!isLangOpen)}
                                    className={`
                                        w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all group active:scale-90 font-black text-[10px] sm:text-xs uppercase tracking-wider
                                        ${isLangOpen ? "bg-slate-900 text-white" : "hover:bg-slate-900/5"}
                                    `}
                                    title="Choose language"
                                >
                                    <span className={`${(transparent && !scrolled && !isLangOpen) ? "text-white" : (isLangOpen ? "text-white" : "text-slate-400")} group-hover:text-slate-900 transition-colors`}>
                                        {LANGUAGE_DETAILS[lang as Locale]?.flag || "🌐"}
                                    </span>
                                </button>

                                {isLangOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setIsLangOpen(false)}
                                        />
                                        <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200 border border-slate-100 py-3 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                            <div className="px-5 py-2 mb-2 border-b border-slate-50">
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Choose Language</span>
                                            </div>
                                            {LANGUAGE_CYCLE.map((l) => (
                                                <button
                                                    key={l}
                                                    onClick={() => handleLanguageSelect(l)}
                                                    className={`
                                                        w-full px-5 py-3 flex items-center justify-between transition-all group
                                                        ${lang === l ? "bg-slate-50 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-base">{LANGUAGE_DETAILS[l].flag}</span>
                                                        <span className={`text-[11px] font-black uppercase tracking-tight ${lang === l ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900"}`}>
                                                            {LANGUAGE_DETAILS[l].native}
                                                        </span>
                                                    </div>
                                                    {lang === l && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className={`h-6 sm:h-8 w-[1px] ${(transparent && !scrolled) ? "bg-white/10" : "bg-slate-100"} mx-1 sm:mx-2`} />

                        {rightButtons.length > 0 ? (
                            rightButtons.map((button, index) => (
                                <button 
                                    key={index} 
                                    className="h-10 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:bg-slate-900 hover:text-white text-slate-500 border border-transparent active:scale-95" 
                                    onClick={button.onClick}
                                >
                                    {button.label}
                                </button>
                            ))
                        ) : user ? (
                            <Link 
                                href={`/${lang}/profile`}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg sm:text-xl hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all group active:scale-90"
                            >
                                <span className="group-hover:scale-110 transition-transform">👤</span>
                            </Link>
                        ) : (
                            <Link 
                                href={`/${lang}/auth/login`}
                                className={`h-10 sm:h-12 px-5 sm:px-8 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.15em] flex items-center justify-center transition-all ${
                                    (transparent && !scrolled) 
                                    ? "bg-white text-slate-900 hover:bg-emerald-400" 
                                    : "bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-emerald-500"
                                } active:scale-95 scale-95 hover:scale-100 shadow-2xl`}
                            >
                                {actions?.login || "Login"}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
