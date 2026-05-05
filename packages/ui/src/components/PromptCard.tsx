"use client";
import React from "react";
import { clsx } from "clsx";
import { GlassCard } from "./GlassCard.js";
import { NeonButton } from "./NeonButton.js";

interface PromptCardProps {
  id: string;
  title: string;
  content: string;
  model?: string;
  tokensUsed?: number;
  createdAt?: Date;
  tags?: string[];
  onCopy?: (id: string) => void;
  onOptimize?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function PromptCard({
  id,
  title,
  content,
  model,
  tokensUsed,
  createdAt,
  tags = [],
  onCopy,
  onOptimize,
  onDelete,
  className,
}: PromptCardProps) {
  return (
    <GlassCard hover variant="cyan" className={clsx("group", className)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
        {model && (
          <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full border border-[rgba(168,85,247,0.4)] text-[#A855F7] bg-[rgba(168,85,247,0.1)]">
            {model}
          </span>
        )}
      </div>

      <p className="text-xs text-gray-400 line-clamp-3 mb-4 font-mono leading-relaxed">
        {content}
      </p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.15)] text-[rgba(0,245,255,0.7)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {tokensUsed !== undefined && (
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
              </svg>
              {tokensUsed.toLocaleString()} tokens
            </span>
          )}
          {createdAt && (
            <span>
              {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onCopy && (
            <button
              onClick={() => onCopy(id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#00F5FF] hover:bg-[rgba(0,245,255,0.1)] transition-colors"
              title="Copy"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          {onOptimize && (
            <button
              onClick={() => onOptimize(id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#A855F7] hover:bg-[rgba(168,85,247,0.1)] transition-colors"
              title="Optimize"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-[rgba(255,0,0,0.1)] transition-colors"
              title="Delete"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
