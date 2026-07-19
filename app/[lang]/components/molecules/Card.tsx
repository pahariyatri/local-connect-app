"use client";

import React, { ReactNode } from "react";
import Typography from "../atoms/Typography";
import Image from "../atoms/Image";

type CardProps = {
    title: string;
    description: string;
    imageSrc?: string;
    className?: string;
    children?: ReactNode;
    onClick?: () => void;
};

export default function Card({ title, description, imageSrc, className, children, onClick }: CardProps) {
    return (
        <div
            className={`premium-card overflow-hidden cursor-pointer ${className || ""}`}
            onClick={onClick}
        >
            {imageSrc && (
                <div className="relative h-48 overflow-hidden group">
                    <Image src={imageSrc} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
            )}
            <div className="p-5">
                <Typography variant="h3" className="text-xl font-bold text-slate-800 mb-2 leading-tight">{title}</Typography>
                <Typography variant="p" className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{description}</Typography>
                {children && <div className="mt-4">{children}</div>}
            </div>
        </div>
    );
}
