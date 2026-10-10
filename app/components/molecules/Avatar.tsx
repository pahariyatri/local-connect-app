"use client";

import React from "react";
import Image from "../atoms/Image";

type AvatarProps = {
    src: string;
    alt: string;
    size?: "small" | "medium" | "large";
};

export default function Avatar({ src, alt, size = "medium" }: AvatarProps) {
    const sizes = {
        small: "w-8 h-8",
        medium: "w-12 h-12",
        large: "w-16 h-16",
    };

    return (
        <Image src={src} alt={alt} className={`rounded-full ${sizes[size]}`} />
    );
}
