import type { Config } from "tailwindcss";
import baseConfig from "../../packages/ui/tailwind.config";

const config: Config = {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;
