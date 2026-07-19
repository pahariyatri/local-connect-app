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
      h1: "text-4xl sm:text-5xl font-black text-slate-900 tracking-tight",
      h2: "text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight",
      h3: "text-xl font-bold text-slate-800",
      p: "text-base text-slate-600 leading-relaxed",
    };
  
    const Component = variant;
  
    return <Component className={`${variants[variant]} ${className}`} {...props}>{children}</Component>;
  }
  