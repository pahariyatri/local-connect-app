"use client";

import React from "react";

interface StarRatingProps {
    rating: number;
    count?: number;
    size?: "small" | "medium";
    className?: string;
}

export default function StarRating({ rating, count, size = "small", className = "" }: StarRatingProps) {
    const starSize = size === "small" ? "14" : "18";
    
    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                    <svg 
                        key={i}
                        xmlns="http://www.w3.org/2000/svg" 
                        width={starSize} 
                        height={starSize} 
                        viewBox="0 0 24 24" 
                        fill={i < Math.floor(rating) ? "currentColor" : "none"} 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                ))}
            </div>
            <span className={`font-bold text-slate-700 ${size === "small" ? "text-xs" : "text-sm"}`}>
                {rating.toFixed(1)}
            </span>
            {count !== undefined && (
                <span className={`text-slate-400 font-medium ${size === "small" ? "text-[10px]" : "text-xs"}`}>
                    ({count})
                </span>
            )}
        </div>
    );
}
