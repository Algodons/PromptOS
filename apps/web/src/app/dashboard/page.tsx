import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard – PromptOS" };

const stats = [
  { label: "Prompts Created", value: "0", change: "+0%", color: "#00F5FF" },
  { label: "Tokens Used", value: "0", change: "+0%", color: "#A855F7" },
  { label: "API Calls", value: "0", change: "+0%", color: "#00FF88" },
  { label: "Cost (USD)", value: "$0.00", change: "+0%", color: "#FF0090" },
];

const quickActions = [
  { label: "New Prompt", href: "/optimizer", icon: "✦", color: "#00F5FF" },
  { label: "Plugins", href: "/plugins", icon: "⬡", color: "#A855F7" },
  { label: "API Keys", href: "/settings/api", icon: "⚿", color: "#00FF88" },
  { label: "Billing", href: "/billing", icon: "◈", color: "#FF0090" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[Orbitron] text-white">
            Command Center
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">PromptOS Dashboard</p>
        </div>
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-[#00F5FF] transition-colors"
        >
          ← Home
        </Link>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border backdrop-blur-[12px] bg-[linear-gradient(135deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)] border-[rgba(255,255,255,0.08)] p-4"
          >
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold font-mono" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-600 mt-1">{stat.change} this month</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group rounded-xl border backdrop-blur-[12px] bg-[linear-gradient(135deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)] border-[rgba(255,255,255,0.08)] p-4 flex flex-col items-center gap-2 hover:border-[rgba(0,245,255,0.3)] hover:shadow-[0_0_20px_rgba(0,245,255,0.1)] transition-all duration-200"
          >
            <span className="text-3xl" style={{ filter: `drop-shadow(0 0 8px ${action.color})` }}>
              {action.icon}
            </span>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border backdrop-blur-[12px] bg-[linear-gradient(135deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)] border-[rgba(0,245,255,0.2)] p-6">
        <h2 className="text-sm font-semibold text-white mb-4 font-[Orbitron]">Recent Activity</h2>
        <div className="flex items-center justify-center h-32 text-gray-600 text-sm">
          No activity yet. Create your first prompt to get started.
        </div>
      </div>
    </div>
  );
}
