"use client";

import React from "react";

type BadgeProps = {
    text: string;
    color?: "blue" | "green" | "red" | "gray";
    className?: string;
};

export default function Badge({ text, color = "blue", className }: BadgeProps) {
    const colors = {
        blue: "bg-blue-100 text-blue-700",
        green: "bg-green-100 text-green-700",
        red: "bg-red-100 text-red-700",
        gray: "bg-slate-100 text-slate-700",
    };

    return (
        <span className={`px-2 py-1 text-sm font-medium rounded ${colors[color]} ${className}`}>
            {text}
        </span>
    );
}
