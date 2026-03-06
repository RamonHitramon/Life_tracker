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
        background: "#000000",
        surface: "#0c0c0c",
        "surface-light": "#141414",
        border: "#262626",
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
