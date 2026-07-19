"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TopNavigation from "../components/organisms/TopNavigation";
import BottomNavigation from "../components/organisms/BottomNavigation";
import { useLocalizationContext } from "@/contexts/LocalizationContext";
import { Locale } from "@/i18n-config";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { switchLanguage } = useLocalizationContext();
    
    // Check if we are in onboarding to potentially shift layout
    const isOnboarding = pathname.includes("/onboarding");

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* 
              Global Header for Vendor Section. 
            */}
            {!isOnboarding && (
                <TopNavigation onToggleLanguage={(l: Locale | undefined) => l && switchLanguage(l)} />
            )}
            
            <div className={`transition-all duration-700 ${!isOnboarding ? "pt-24 pb-32" : ""}`}>
                {children}
            </div>
            
            {!isOnboarding && (
                <BottomNavigation onToggleLanguage={(l: Locale | undefined) => l && switchLanguage(l)} />
            )}
        </div>
    );
}
