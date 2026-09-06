"use client";

import React from "react";
import { usePathname } from "next/navigation";

// The root layout (app/[lang]/layout.tsx) already renders TopNavigation/
// BottomNavigation for every non-auth route, vendor routes included — this
// used to render a *second* copy of both, stacked exactly on top of the
// root's (same fixed position), invisible in a screenshot but doubling up
// in the DOM. This layout now only owns the content offset/padding.
//
// Only the static vendor-management subroutes actually need that padding —
// they render inside the shared app chrome (the global fixed TopNavigation
// from `[lang]/layout.tsx`) and need clearance below it. Onboarding and the
// public vendor profile page (`/vendor/[id]`) render their own full-bleed
// header/hero and manage their own top spacing (the profile hero uses its
// own `pt-20`/`pt-24`); stacking this wrapper's `pt-10` on top of that left
// a ~40px gap of this wrapper's bg-slate-50 above the hero, with nothing
// dark behind the profile page's transparent fixed nav for that gap.
const KNOWN_VENDOR_SUBROUTES = ["dashboard", "bookings", "calendar", "contracts", "onboarding", "partnerships", "payouts", "services"];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const vendorSegment = pathname.split("/").filter(Boolean)[2];
    const hasOwnSpacing = !vendorSegment || !KNOWN_VENDOR_SUBROUTES.includes(vendorSegment);

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className={!hasOwnSpacing ? "pt-6 sm:pt-10 pb-16 sm:pb-24" : ""}>
                {children}
            </div>
        </div>
    );
}
