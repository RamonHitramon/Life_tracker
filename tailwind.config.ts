import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "#12121a",
        "surface-light": "#1a1a26",
        border: "#2a2a3a",
        accent: "#6366f1",
        "accent-light": "#818cf8",
        "accent-glow": "rgba(99, 102, 241, 0.3)",
        teal: "#2dd4bf",
        foreground: "#e2e2e8",
        muted: "#71717a",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Geist Mono", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
