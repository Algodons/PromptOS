import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptOS – AI Command Center",
  description: "The cyber-futuristic AI prompt management and optimization platform",
  keywords: ["AI", "prompts", "LLM", "GPT", "Claude", "Gemini"],
};

export const viewport: Viewport = {
  themeColor: "#05060A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#05060A] text-white antialiased font-mono">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,245,255,0.04)_0%,transparent_60%)] pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.04)_0%,transparent_60%)] pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
