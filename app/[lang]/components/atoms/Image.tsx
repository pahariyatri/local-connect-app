"use client";

import NextImage from 'next/image';

type ImageProps = {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    rounded?: boolean;
    loading?: 'lazy' | 'eager';
};

export default function LocalImage({
    src,
    alt,
    className = "",
    width = 500,
    height = 500,
    rounded = false,
    loading,
}: ImageProps) {
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
        />
    );
}
