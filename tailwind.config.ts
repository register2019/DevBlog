import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "tech-dark": "#080c18",
        "tech-card": "rgba(15, 22, 40, 0.65)",
        "tech-border": "rgba(0, 210, 255, 0.25)",
        "tech-glow": "#00d2ff",
        "tech-accent": "#9c27ff",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;