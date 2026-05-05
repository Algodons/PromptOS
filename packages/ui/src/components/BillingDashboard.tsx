"use client";
import React from "react";
import { clsx } from "clsx";
import { GlassCard } from "./GlassCard.js";
import { NeonButton } from "./NeonButton.js";
import { SubscriptionTier, TierLimits } from "@promptos/contracts";

interface UsageBar {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}

interface BillingDashboardProps {
  tier: SubscriptionTier;
  usageBars?: UsageBar[];
  onUpgrade?: () => void;
  onManageBilling?: () => void;
  nextRenewal?: Date;
  costThisMonth?: number;
}

const TierColors: Record<SubscriptionTier, string> = {
  FREE: "text-gray-400 border-gray-600",
  PRO: "text-[#00F5FF] border-[rgba(0,245,255,0.4)]",
  ENTERPRISE: "text-[#A855F7] border-[rgba(168,85,247,0.4)]",
};

export function BillingDashboard({
  tier,
  usageBars = [],
  onUpgrade,
  onManageBilling,
  nextRenewal,
  costThisMonth,
}: BillingDashboardProps) {
  const limits = TierLimits[tier];

  return (
    <div className="space-y-4">
      <GlassCard variant={tier === "ENTERPRISE" ? "purple" : tier === "PRO" ? "cyan" : "default"}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Current Plan</p>
            <h2 className={clsx("text-2xl font-bold font-mono", TierColors[tier])}>{tier}</h2>
          </div>
          <div className={clsx("px-3 py-1.5 rounded-full border text-sm font-mono", TierColors[tier])}>
            {tier === "FREE" ? "Free Forever" : tier === "PRO" ? "$29/mo" : "Custom"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Monthly Tokens</p>
            <p className="text-sm font-mono text-white">
              {limits.monthlyTokens === -1 ? "Unlimited" : limits.monthlyTokens.toLocaleString()}
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Rate Limit</p>
            <p className="text-sm font-mono text-white">
              {limits.rateLimit.requests} req/{limits.rateLimit.windowSeconds}s
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Plugins</p>
            <p className="text-sm font-mono text-white">
              {limits.maxPlugins === -1 ? "Unlimited" : `Up to ${limits.maxPlugins}`}
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Team Members</p>
            <p className="text-sm font-mono text-white">
              {limits.maxTeamMembers === -1 ? "Unlimited" : limits.maxTeamMembers}
            </p>
          </div>
        </div>

        {nextRenewal && (
          <p className="text-xs text-gray-500 mb-4">
            Next renewal: {new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(nextRenewal)}
          </p>
        )}

        <div className="flex gap-2">
          {tier !== "ENTERPRISE" && onUpgrade && (
            <NeonButton variant="cyan" size="sm" onClick={onUpgrade} className="flex-1">
              Upgrade Plan
            </NeonButton>
          )}
          {onManageBilling && (
            <NeonButton variant="ghost" size="sm" onClick={onManageBilling} className="flex-1">
              Manage Billing
            </NeonButton>
          )}
        </div>
      </GlassCard>

      {usageBars.length > 0 && (
        <GlassCard variant="default">
          <h3 className="text-sm font-semibold text-white mb-4">Usage This Month</h3>
          <div className="space-y-4">
            {usageBars.map((bar) => {
              const pct = bar.limit === -1 ? 0 : Math.min((bar.used / bar.limit) * 100, 100);
              const isWarning = pct > 75;
              const isDanger = pct > 90;

              return (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">{bar.label}</span>
                    <span className={clsx(
                      "font-mono",
                      isDanger ? "text-red-400" : isWarning ? "text-yellow-400" : "text-[#00F5FF]"
                    )}>
                      {bar.limit === -1
                        ? `${bar.used.toLocaleString()} ${bar.unit ?? ""} / ∞`
                        : `${bar.used.toLocaleString()} / ${bar.limit.toLocaleString()} ${bar.unit ?? ""}`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all duration-500",
                        isDanger
                          ? "bg-gradient-to-r from-red-600 to-red-400"
                          : isWarning
                          ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                          : "bg-gradient-to-r from-[#00F5FF] to-[#A855F7]"
                      )}
                      style={{ width: bar.limit === -1 ? "0%" : `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {costThisMonth !== undefined && (
            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] flex justify-between items-center">
              <span className="text-xs text-gray-500">Estimated Cost</span>
              <span className="text-sm font-mono text-[#00F5FF]">
                ${(costThisMonth / 100).toFixed(2)}
              </span>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
