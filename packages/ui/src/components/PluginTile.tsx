"use client";
import React from "react";
import { clsx } from "clsx";
import { GlassCard } from "./GlassCard.js";
import { NeonButton } from "./NeonButton.js";
import { SubscriptionTier, PluginCategory } from "@promptos/contracts";

interface PluginTileProps {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: PluginCategory;
  requiredTier: SubscriptionTier;
  iconUrl?: string;
  installed?: boolean;
  enabled?: boolean;
  userTier?: SubscriptionTier;
  onInstall?: (id: string) => void;
  onUninstall?: (id: string) => void;
  onToggle?: (id: string, enabled: boolean) => void;
  className?: string;
}

const CategoryColors: Record<PluginCategory, string> = {
  ai_enhancer: "text-[#00F5FF] bg-[rgba(0,245,255,0.1)] border-[rgba(0,245,255,0.3)]",
  data_source: "text-[#A855F7] bg-[rgba(168,85,247,0.1)] border-[rgba(168,85,247,0.3)]",
  exporter: "text-[#00FF88] bg-[rgba(0,255,136,0.1)] border-[rgba(0,255,136,0.3)]",
  automation: "text-yellow-400 bg-[rgba(250,204,21,0.1)] border-[rgba(250,204,21,0.3)]",
  integration: "text-orange-400 bg-[rgba(251,146,60,0.1)] border-[rgba(251,146,60,0.3)]",
  analytics: "text-pink-400 bg-[rgba(244,114,182,0.1)] border-[rgba(244,114,182,0.3)]",
};

export function PluginTile({
  id,
  name,
  description,
  version,
  author,
  category,
  requiredTier,
  iconUrl,
  installed = false,
  enabled = true,
  userTier = SubscriptionTier.FREE,
  onInstall,
  onUninstall,
  onToggle,
  className,
}: PluginTileProps) {
  const tierOrder = [SubscriptionTier.FREE, SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE];
  const canInstall = tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);

  return (
    <GlassCard
      hover={canInstall}
      variant={installed && enabled ? "cyan" : "default"}
      className={clsx("relative", className)}
    >
      {!canInstall && (
        <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full border border-yellow-500/40 text-yellow-400 bg-yellow-500/10 font-mono">
          {requiredTier}+
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        {iconUrl ? (
          <img src={iconUrl} alt={name} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-[rgba(0,245,255,0.1)] border border-[rgba(0,245,255,0.2)] flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-[#00F5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-white truncate">{name}</h3>
            <span className="text-xs text-gray-600 font-mono flex-shrink-0">v{version}</span>
          </div>
          <p className="text-xs text-gray-500 truncate">by {author}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 line-clamp-2 mb-3">{description}</p>

      <div className="flex items-center gap-2 mb-3">
        <span className={clsx("text-xs px-2 py-0.5 rounded-full border capitalize", CategoryColors[category])}>
          {category.replace("_", " ")}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {installed ? (
          <>
            <NeonButton
              variant={enabled ? "ghost" : "cyan"}
              size="sm"
              onClick={() => onToggle?.(id, !enabled)}
              className="flex-1 text-xs"
            >
              {enabled ? "Disable" : "Enable"}
            </NeonButton>
            <NeonButton
              variant="danger"
              size="sm"
              onClick={() => onUninstall?.(id)}
              className="text-xs px-2"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </NeonButton>
          </>
        ) : (
          <NeonButton
            variant="cyan"
            size="sm"
            disabled={!canInstall}
            onClick={() => onInstall?.(id)}
            className="flex-1 text-xs"
          >
            {canInstall ? "Install" : `Requires ${requiredTier}`}
          </NeonButton>
        )}
      </div>
    </GlassCard>
  );
}
