"use client";

import React from "react";

interface VerifiedBadgeProps {
    className?: string;
    showText?: boolean;
}

export default function VerifiedBadge({ className = "", showText = true }: VerifiedBadgeProps) {
    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 ${className}`}>
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </div>
            {showText && <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Verified</span>}
        </div>
    );
}
