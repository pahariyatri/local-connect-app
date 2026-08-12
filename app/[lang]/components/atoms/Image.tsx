"use client";

import NextImage from 'next/image';
import { useEffect, useState } from 'react';

/** Shipped branded fallback (public/images/destination-placeholder.jpg). */
export const PLACEHOLDER_IMAGE = '/images/destination-placeholder.jpg';

type ImageProps = {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    rounded?: boolean;
    loading?: 'lazy' | 'eager';
};

/**
 * Neutral, designed empty state. Rendered when the image source is missing or
 * fails to load, so a listing never shows a broken-image icon or floating alt
 * text (PY-009 / PY-025). Decorative only — the alt text is intentionally not
 * painted here; the surrounding card already carries the accessible name.
 */
function ImageFallback({ className, rounded }: { className?: string; rounded?: boolean }) {
    return (
        <div
            aria-hidden="true"
            className={`flex items-center justify-center bg-gradient-to-b from-emerald-100 to-emerald-200 ${rounded ? 'rounded-full' : 'rounded-lg'} ${className ?? ''}`}
        >
            <svg
                viewBox="0 0 48 32"
                className="h-1/2 w-1/2 max-h-12 max-w-12 text-emerald-600/70"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            >
                <path d="M2 27 L14 12 L21 20 L29 7 L46 27 Z" />
                <circle cx="37" cy="7" r="3" />
            </svg>
        </div>
    );
}

export default function LocalImage({
    src,
    alt,
    className = "",
    width = 500,
    height = 500,
    rounded = false,
    loading,
}: ImageProps) {
    const [failed, setFailed] = useState(false);

    // A card can be recycled onto a new src (filter change, pagination) — clear
    // the failed flag so a good image after a bad one still renders.
    useEffect(() => { setFailed(false); }, [src]);

    if (!src || failed) {
        return <ImageFallback className={className} rounded={rounded} />;
    }

    const isExternal = src.startsWith('http');

    return (
        <NextImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`object-cover ${rounded ? "rounded-full" : "rounded-lg"} ${className}`}
            unoptimized={isExternal}
            loading={loading}
            onError={() => setFailed(true)}
        />
    );
}
