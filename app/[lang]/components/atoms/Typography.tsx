import React from "react";

type TypographyProps = {
    variant: "h1" | "h2" | "h3" | "p" | "eyebrow";
    children?: React.ReactNode;
    className?: string;
} & React.HTMLAttributes<HTMLElement>;

  // "eyebrow" isn't a real HTML tag — small uppercase label line used above a
  // heading (e.g. "Curated Routes", "Verified Locals"). Renders as a <span>.
  const TAGS: Record<TypographyProps["variant"], string> = {
    h1: "h1", h2: "h2", h3: "h3", p: "p", eyebrow: "span",
  };

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
      eyebrow: "text-xs font-black uppercase tracking-widest block",
    };

    const defaultColors = {
      h1: "text-slate-900",
      h2: "text-slate-800",
      h3: "text-slate-800",
      p: "text-slate-600",
      eyebrow: "text-emerald-600",
    };

    const hasTextColor = /\btext-(?:[a-z0-9]+|\[.+\])/.test(className);
    const colorClass = hasTextColor ? "" : defaultColors[variant];

    const Component = TAGS[variant] as any;

    return <Component className={`${variants[variant]} ${colorClass} ${className}`.trim()} {...props}>{children}</Component>;
  }

  