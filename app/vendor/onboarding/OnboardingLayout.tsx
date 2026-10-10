"use client";

import React from "react";

/**
 * Shell for every /vendor/onboarding/* page: clears the fixed TopNavigation
 * header and gives the step content a consistent max width. Deliberately
 * thin — no card, no decorative panel — the step content and its own fixed
 * action footer (see page.tsx) provide the actual chrome.
 *
 * Previously this used `h-screen ... overflow-hidden` to force a "zero
 * scroll" page, which instead just clipped any content taller than the
 * viewport. Content now scrolls normally; the footer stays fixed via its
 * own portal.
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-dvh bg-white">
            {/* Single controlled-width column — no sidebar, so the form itself sets
                the page width. Matches confirmation/page.tsx's own max-w-md, just
                wide enough for the step-2 category grid to breathe. */}
            <div className="max-w-2xl mx-auto px-4 pt-28 sm:pt-36 pb-32 sm:pb-40">
                {children}
            </div>
        </div>
    );
}
