"use client";
import { useState } from "react";
import Link from "next/link";

export default function OptimizerPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<{
    optimizedPrompt: string;
    improvements: string[];
    scoreImprovement: number;
    tokensReduced: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOptimize() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Optimization failed");
      }
      const data = (await res.json()) as typeof result;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 space-y-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[Orbitron] text-white">
            Prompt Optimizer
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-powered prompt enhancement</p>
        </div>
        <Link href="/dashboard" className="text-xs text-gray-500 hover:text-[#00F5FF] transition-colors">
          ← Dashboard
        </Link>
      </header>

      <div className="rounded-xl border border-[rgba(0,245,255,0.2)] backdrop-blur-[12px] bg-[linear-gradient(135deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)] p-6">
        <label className="block text-sm text-gray-400 mb-3">Your Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          rows={6}
          className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg p-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[rgba(0,245,255,0.4)] transition-colors font-mono"
        />
        <button
          onClick={() => void handleOptimize()}
          disabled={!prompt.trim() || loading}
          className="mt-4 px-6 py-2.5 rounded-lg border border-[#00F5FF] bg-[rgba(0,245,255,0.1)] text-[#00F5FF] text-sm font-medium hover:bg-[rgba(0,245,255,0.2)] hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Optimizing..." : "✦ Optimize Prompt"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[rgba(0,255,136,0.3)] backdrop-blur-[12px] bg-[linear-gradient(135deg,rgba(0,255,136,0.05)_0%,rgba(0,255,136,0.01)_100%)] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#00FF88]">Optimized Prompt</h3>
              <div className="flex gap-3 text-xs font-mono">
                <span className="text-[#00F5FF]">+{result.scoreImprovement}% score</span>
                <span className="text-[#A855F7]">-{result.tokensReduced} tokens</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed font-mono">{result.optimizedPrompt}</p>
            <button
              onClick={() => void navigator.clipboard.writeText(result.optimizedPrompt)}
              className="mt-3 text-xs text-gray-500 hover:text-[#00F5FF] transition-colors"
            >
              Copy to clipboard ↗
            </button>
          </div>

          {result.improvements.length > 0 && (
            <div className="rounded-xl border border-[rgba(168,85,247,0.2)] backdrop-blur-[12px] bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.01)_100%)] p-6">
              <h3 className="text-sm font-semibold text-[#A855F7] mb-3">Improvements Made</h3>
              <ul className="space-y-1.5">
                {result.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="text-[#00F5FF] mt-0.5 flex-shrink-0">▸</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
