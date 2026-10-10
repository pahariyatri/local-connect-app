"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { BRAND_CONFIG } from "@/config/brandConfig";

interface TopNavigationProps {
    title?: string;
    leftButton?: { label: string; onClick: () => void };
    rightButtons?: { label: string; onClick: () => void }[];
    transparent?: boolean;
}

export default function TopNavigation({
    title = BRAND_CONFIG.parentBrandName,
    leftButton,
    rightButtons = [],
    transparent = false,
}: TopNavigationProps) {
    const { user } = useAuth();
    const { dict } = useLocalizationContext();

    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const actions = dict?.page?.common?.actions;
    const isDefaultBrandTitle = title === BRAND_CONFIG.parentBrandName || title === "Pahari Yatri";

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
                            <div className="flex items-center gap-3.5 group">
                                <Link
                                    href={`/`}
                                    aria-label={`${BRAND_CONFIG.productDisplayName} — ${BRAND_CONFIG.productDescriptor}`}
                                    title={BRAND_CONFIG.fullProductName}
                                    className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white text-xs shadow-2xl rotate-[12deg] group-hover:rotate-0 transition-all duration-500 active:scale-90 flex-shrink-0"
                                >
                                    {BRAND_CONFIG.brandInitials}
                                </Link>
                                <div className="flex flex-col">
                                    {isDefaultBrandTitle ? (
                                        <>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[11px] sm:text-xs font-black uppercase tracking-[0.22em] italic leading-none ${(transparent && !scrolled) ? "text-white" : "text-slate-900"}`}>
                                                    {BRAND_CONFIG.headerBrandTitle}
                                                </span>
                                                <span className="hidden sm:inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 tracking-wider">
                                                    {BRAND_CONFIG.productStage}
                                                </span>
                                            </div>
                                            <span className={`text-[8px] sm:text-[9px] font-bold tracking-widest uppercase mt-0.5 ${(transparent && !scrolled) ? "text-white/70" : "text-emerald-600"}`}>
                                                {BRAND_CONFIG.headerBrandSubtitle}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className={`text-[11px] sm:text-xs font-black uppercase tracking-[0.3em] italic leading-none ${(transparent && !scrolled) ? "text-white" : "text-slate-900"}`}>
                                                {title}
                                            </span>
                                            {(!transparent || scrolled) && (
                                                <div className="w-12 h-1 bg-emerald-500/30 rounded-full mt-2 group-hover:w-full transition-all duration-700" />
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
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
                            <>
                                {/* /vendor/onboarding self-resolves to the dashboard for an
                                    existing vendor, or the wizard for a traveler-only account —
                                    this is the one persistent, app-wide entry point into the
                                    vendor side (previously only reachable from the landing page). */}
                                <Link
                                    href={`/vendor/onboarding`}
                                    className={`h-10 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:bg-slate-900 hover:text-white flex items-center ${
                                        (transparent && !scrolled) ? "text-white/80" : "text-slate-500"
                                    }`}
                                >
                                    For Vendors
                                </Link>
                                <Link
                                    href={`/profile`}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs sm:text-sm hover:bg-emerald-600 transition-all group active:scale-90 shadow-md border border-slate-800"
                                    title={user?.name || "My Account"}
                                >
                                    {user?.name ? user.name.slice(0, 2).toUpperCase() : user?.phone ? user.phone.slice(-2) : "PY"}
                                </Link>
                            </>
                        ) : (
                            <Link
                                href={`/auth/login`}
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
