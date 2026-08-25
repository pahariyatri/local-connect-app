"use client";

import React from "react";
import { usePathname } from "next/navigation";

// The root layout (app/[lang]/layout.tsx) already renders TopNavigation/
// BottomNavigation for every non-auth route, vendor routes included — this
// used to render a *second* copy of both, stacked exactly on top of the
// root's (same fixed position), invisible in a screenshot but doubling up
// in the DOM. This layout now only owns the content offset/padding.
export default function VendorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Onboarding renders its own OnboardingLayout with its own spacing.
    const isOnboarding = pathname.includes("/onboarding");

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className={!isOnboarding ? "pt-6 sm:pt-10 pb-16 sm:pb-24" : ""}>
                {children}
            </div>
        </div>
    );
}
