import React from "react";

type TypographyProps = {
    variant: "h1" | "h2" | "h3" | "p";
    children?: React.ReactNode;
    className?: string;
} & React.HTMLAttributes<HTMLElement>;
  
  export default function Typography({
    variant,
    children,
    className = "",
    ...props
  }: TypographyProps) {
    const variants = {
      h1: "text-4xl sm:text-5xl font-black tracking-tight",
      h2: "text-2xl sm:text-3xl font-bold tracking-tight",
      h3: "text-xl font-bold",
      p: "text-base leading-relaxed",
    };

    const defaultColors = {
      h1: "text-slate-900",
      h2: "text-slate-800",
      h3: "text-slate-800",
      p: "text-slate-600",
    };

    const hasTextColor = /\btext-(?:[a-z0-9]+|\[.+\])/.test(className);
    const colorClass = hasTextColor ? "" : defaultColors[variant];
  
    const Component = variant;
  
    return <Component className={`${variants[variant]} ${colorClass} ${className}`.trim()} {...props}>{children}</Component>;
  }

  