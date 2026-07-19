"use client";

import React from "react";
import { useLocalizationContext } from "@/contexts/LocalizationContext";

/**
 * Clean, minimalistic layout for onboarding.
 * Removes redundant navigation and centers focus on the onboarding flow.
 * Optimized for mobile-first, zero-scroll approach.
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const { dict } = useLocalizationContext();
    
    if (!dict) return null;

    return (
        <div className="min-h-screen bg-white sm:bg-slate-50 overflow-hidden relative font-sans">
            {/* Minimal Background Context - Fixed to stay out of content's way */}
            <div className="hidden sm:block absolute top-0 left-0 w-full h-[500px] bg-slate-900 -z-10" />
            
            <div className="w-full max-w-2xl mx-auto h-screen sm:h-auto sm:pt-16 sm:pb-20 flex flex-col">
                {/* Main Content Card - Fills screen on mobile, fits-content on desktop */}
                <div className="flex-1 bg-white px-5 py-6 sm:p-12 sm:rounded-[3rem] sm:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] sm:border sm:border-slate-100 flex flex-col overflow-hidden">
                    {children}
                </div>
                
                {/* Mobile specific padding to avoid action bar overlap if not fixed */}
                <div className="h-20 sm:hidden flex-shrink-0" />
                
                <div className="hidden sm:flex mt-8 justify-center gap-6 opacity-30">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Secure Protocol</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Partner Verification</span>
                </div>
            </div>
        </div>
    );
}
