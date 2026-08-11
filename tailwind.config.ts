import type { Config } from "tailwindcss";

/**
 * Tailwind theme wired to the design tokens in app/globals.css.
 * Prefer the semantic names (primary, brand, surface, card…) in components so
 * a token change restyles the whole app consistently.
 *
 * `emerald` and `slate` are overridden below (not extended piecemeal) with a
 * full 50–950 ramp each. The app uses `emerald-*` consistently as its one
 * brand-accent color and `slate-*` consistently as its one neutral scale
 * across ~100+ component files — so re-defining what those two names *mean*
 * recolors the whole product to the mountain/local/premium palette in one
 * place, without a mechanical per-file rewrite. Same lightness distribution
 * as Tailwind's defaults (50 lightest → 950 darkest), only the hue/warmth
 * changed, so existing usage (light shade = bg tint, dark shade = text/button)
 * keeps working exactly as before.
 */
const forestPine = {
  50: "#f2f8f6", 100: "#e0f0ec", 200: "#c0e3da", 300: "#94d1c2", 400: "#5fbfa7",
  500: "#3b9b83", 600: "#2c7764", 700: "#205a4c", 800: "#1a473c", 900: "#173f35", 950: "#102d26",
};
const warmStone = {
  50: "#f7fbf9", 100: "#f0f5f2", 200: "#e0e6e3", 300: "#c7d1cc", 400: "#9fada6",
  500: "#778880", 600: "#66736c", 700: "#495a52", 800: "#313f38", 900: "#17201c", 950: "#0d120f",
};

export default {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        emerald: forestPine,
        slate: warmStone,
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          hover: "hsl(var(--brand-hover))",
          soft: "hsl(var(--brand-soft))",
          foreground: "hsl(var(--brand-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        danger: "hsl(var(--danger))",
        warning: "hsl(var(--warning))",
        success: "hsl(var(--success))",
        subtle: "hsl(var(--border-subtle))",
      },
      borderRadius: {
        control: "var(--radius-control)",
        card: "var(--radius-card)",
        panel: "var(--radius-panel)",
      },
      height: {
        control: "var(--h-control)",
        "control-sm": "var(--h-control-sm)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
      },
    },
  },
  plugins: [],
} satisfies Config;
