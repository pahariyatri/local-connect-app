import type { Config } from "tailwindcss";

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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#10b981", // Emerald-500
          hover: "#059669",   // Emerald-600
        },
        secondary: "#6366f1", // Indigo-500
        accent: "#f59e0b",    // Amber-500
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
