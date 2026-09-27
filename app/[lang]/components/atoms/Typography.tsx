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
      h1: "text-4xl sm:text-5xl font-extrabold tracking-[var(--tracking-display)] leading-[1.1] text-balance",
      h2: "text-2xl sm:text-3xl font-bold tracking-[var(--tracking-heading)] leading-[1.2] text-balance",
      h3: "text-xl font-bold tracking-tight leading-snug",
      p: "text-base leading-relaxed",
      eyebrow: "text-[11px] font-semibold uppercase tracking-[0.12em] block",
    };

    const defaultColors = {
      h1: "text-slate-900",
      h2: "text-slate-800",
      h3: "text-slate-800",
      p: "text-slate-600",
      eyebrow: "text-emerald-600",
    };

    const hasTextColor = /\btext-(?:slate|emerald|white|black|red|rose|amber|green|blue|gray|foreground|muted|brand|primary|danger|success|inherit|current|transparent)(?:-\d{2,3})?\b|\btext-\[(?:#|rgb|hsl|color:)/.test(className);
    const colorClass = hasTextColor ? "" : defaultColors[variant];

    const Component = TAGS[variant] as any;

    return <Component className={`${variants[variant]} ${colorClass} ${className}`.trim()} {...props}>{children}</Component>;
  }

  