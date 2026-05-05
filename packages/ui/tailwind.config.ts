import type { Config } from "tailwindcss";

export const cyberpunkTheme = {
  colors: {
    "deep-space": "#05060A",
    "neon-cyan": "#00F5FF",
    "electric-purple": "#A855F7",
    "neon-green": "#00FF88",
    "hot-pink": "#FF0090",
    "dark-glass": "rgba(255, 255, 255, 0.05)",
    "glass-border": "rgba(0, 245, 255, 0.2)",
    "glass-border-purple": "rgba(168, 85, 247, 0.3)",
  },
  extend: {
    backgroundImage: {
      "cyber-gradient": "linear-gradient(135deg, #05060A 0%, #0D0F1A 50%, #10081A 100%)",
      "neon-glow": "linear-gradient(90deg, #00F5FF 0%, #A855F7 100%)",
      "glass-card": "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
    },
    boxShadow: {
      "neon-cyan": "0 0 20px rgba(0, 245, 255, 0.4), 0 0 40px rgba(0, 245, 255, 0.1)",
      "neon-purple": "0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.1)",
      "neon-green": "0 0 20px rgba(0, 255, 136, 0.4), 0 0 40px rgba(0, 255, 136, 0.1)",
      "glass": "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
      "glass-hover": "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 245, 255, 0.15)",
    },
    backdropBlur: {
      glass: "12px",
    },
    animation: {
      "pulse-neon": "pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      "scan-line": "scan-line 3s linear infinite",
      "float": "float 6s ease-in-out infinite",
      "glow": "glow 2s ease-in-out infinite alternate",
    },
    keyframes: {
      "pulse-neon": {
        "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(0, 245, 255, 0.4)" },
        "50%": { opacity: "0.8", boxShadow: "0 0 40px rgba(0, 245, 255, 0.8)" },
      },
      "scan-line": {
        "0%": { transform: "translateY(-100%)" },
        "100%": { transform: "translateY(100vh)" },
      },
      "float": {
        "0%, 100%": { transform: "translateY(0px)" },
        "50%": { transform: "translateY(-10px)" },
      },
      "glow": {
        "from": { textShadow: "0 0 10px #00F5FF, 0 0 20px #00F5FF" },
        "to": { textShadow: "0 0 20px #A855F7, 0 0 40px #A855F7" },
      },
    },
    fontFamily: {
      mono: ["JetBrains Mono", "Fira Code", "monospace"],
      display: ["Orbitron", "sans-serif"],
    },
  },
};

const config: Config = {
  content: ["../../apps/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: cyberpunkTheme.extend,
    colors: {
      ...cyberpunkTheme.colors,
      white: "#ffffff",
      black: "#000000",
      transparent: "transparent",
      current: "currentColor",
      gray: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
        950: "#030712",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
