"use client";

import React, { ReactNode } from "react";
import Typography from "../atoms/Typography";
import Image from "../atoms/Image";
import StarRating from "../atoms/StarRating";
import VerifiedBadge from "../atoms/VerifiedBadge";

type CardProps = {
    title: string;
    description?: string;
    /** Meta line under the title — e.g. a location. Caller can include an icon (ReactNode). */
    subtitle?: ReactNode;
    imageSrc?: string;
    imageAlt?: string;
    /** Top-left overlay pill on the image — e.g. a category label. */
    badgeText?: string;
    /** Shows a compact VerifiedBadge as a top-right overlay on the image. Ignored when `cornerBadge` is set. */
    verified?: boolean;
    /** Arbitrary top-right overlay on the image (e.g. a booking status pill) — takes priority over `verified`. */
    cornerBadge?: ReactNode;
    /** Renders a StarRating row when present (real rating data only — omit/undefined if unrated, never fabricate). */
    rating?: number | null;
    ratingCount?: number;
    /** Bottom-right price line — e.g. "₹2,500 /night". Caller formats the full string. */
    priceLabel?: string;
    className?: string;
    children?: ReactNode;
    onClick?: () => void;
    /** Pass-through test ids so call sites can keep existing e2e selectors when adopting this shared card. */
    testId?: string;
    subtitleTestId?: string;
    ratingTestId?: string;
};

export default function Card({
    title,
    description,
    subtitle,
    imageSrc,
    imageAlt,
    badgeText,
    verified,
    cornerBadge,
    rating,
    ratingCount,
    priceLabel,
    className,
    children,
    onClick,
    testId,
    subtitleTestId,
    ratingTestId,
}: CardProps) {
    return (
        <div
            data-testid={testId}
            className={`premium-card overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className || ""}`}
            onClick={onClick}
        >
            {imageSrc && (
                <div className="relative h-48 overflow-hidden group">
                    <Image src={imageSrc} alt={imageAlt || title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    {(badgeText || verified || cornerBadge) && (
                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                            {badgeText ? (
                                <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-bold text-slate-700 shadow-sm">
                                    {badgeText}
                                </span>
                            ) : <span />}
                            {cornerBadge || (verified && <VerifiedBadge className="bg-white/90 backdrop-blur-sm shadow-sm" />)}
                        </div>
                    )}
                </div>
            )}
            <div className="p-4 sm:p-5">
                <Typography variant="h3" className="text-base sm:text-lg font-bold text-slate-900 leading-snug truncate">{title}</Typography>
                {subtitle && (
                    <div data-testid={subtitleTestId} className="text-xs sm:text-sm text-slate-500 truncate mt-0.5 flex items-center gap-1">{subtitle}</div>
                )}

                {description && (
                    <Typography variant="p" className="text-slate-500 text-sm line-clamp-2 leading-relaxed mt-2">{description}</Typography>
                )}

                {children}

                {(typeof rating === "number" || priceLabel) && (
                    <div className="mt-3 flex items-center justify-between gap-3">
                        {typeof rating === "number" ? (
                            <div data-testid={ratingTestId}>
                                <StarRating rating={rating} count={ratingCount} size="small" className="shrink-0" />
                            </div>
                        ) : <span />}
                        {priceLabel && (
                            <p className="text-sm sm:text-base font-bold text-brand shrink-0">{priceLabel}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
