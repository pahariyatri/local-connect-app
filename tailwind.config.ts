import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
          // Add others if needed, but Tailwind 3.4.1 has them by default usually.
          // However, the existing config overwrote gray, so I'll fix that.
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
