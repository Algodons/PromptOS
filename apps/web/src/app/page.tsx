import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,245,255,0.3)] bg-[rgba(0,245,255,0.05)] text-xs text-[#00F5FF] mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
          AI Command Center Online
        </div>

        <h1 className="text-5xl md:text-7xl font-bold font-[Orbitron] tracking-tight">
          <span className="text-white">Prompt</span>
          <span className="text-[#00F5FF] neon-text-cyan">OS</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
          The cyber-futuristic AI prompt management platform. Optimize, route, and deploy prompts across OpenAI, Claude, and Gemini.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#00F5FF] bg-[rgba(0,245,255,0.1)] text-[#00F5FF] font-medium text-sm hover:bg-[rgba(0,245,255,0.2)] hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all duration-200"
          >
            Launch Dashboard
          </Link>
          <Link
            href="/optimizer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[rgba(168,85,247,0.4)] bg-[rgba(168,85,247,0.1)] text-[#A855F7] font-medium text-sm hover:bg-[rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-200"
          >
            Optimize Prompts
          </Link>
        </div>
      </div>
    </main>
  );
}
