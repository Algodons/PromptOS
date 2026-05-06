import { z } from "zod";
import { SubscriptionTier } from "./billing.contract.js";

export const UsageMetricSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tier: z.nativeEnum(SubscriptionTier),
  periodStart: z.date(),
  periodEnd: z.date(),
  tokensUsed: z.number().int().nonnegative(),
  promptsUsed: z.number().int().nonnegative(),
  filesUploaded: z.number().int().nonnegative(),
  filesStorageBytes: z.number().int().nonnegative(),
  pluginsActive: z.number().int().nonnegative(),
  apiCallsCount: z.number().int().nonnegative(),
  costUsdCents: z.number().int().nonnegative(),
  lastUpdatedAt: z.date(),
});
export type UsageMetric = z.infer<typeof UsageMetricSchema>;

export const TokenUsageEventSchema = z.object({
  userId: z.string().uuid(),
  model: z.string(),
  provider: z.enum(["openai", "anthropic", "google"]),
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  costUsdCents: z.number().int().nonnegative(),
  requestId: z.string(),
  timestamp: z.date(),
});
export type TokenUsageEvent = z.infer<typeof TokenUsageEventSchema>;

export const PromptUsageEventSchema = z.object({
  userId: z.string().uuid(),
  promptId: z.string(),
  action: z.enum(["create", "optimize", "execute", "share"]),
  timestamp: z.date(),
});
export type PromptUsageEvent = z.infer<typeof PromptUsageEventSchema>;

export const UsageSummarySchema = z.object({
  userId: z.string().uuid(),
  tier: z.nativeEnum(SubscriptionTier),
  current: UsageMetricSchema,
  limits: z.object({
    monthlyTokens: z.number(),
    monthlyPrompts: z.number(),
    maxFileSize: z.number(),
    maxPlugins: z.number(),
  }),
  percentages: z.object({
    tokens: z.number().min(0).max(100),
    prompts: z.number().min(0).max(100),
  }),
  isOverLimit: z.boolean(),
  daysRemainingInPeriod: z.number(),
});
export type UsageSummary = z.infer<typeof UsageSummarySchema>;

export const RecordUsageSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(["tokens", "prompts", "files", "api_calls"]),
  amount: z.number().int().positive(),
  metadata: z.record(z.unknown()).optional(),
});
export type RecordUsageInput = z.infer<typeof RecordUsageSchema>;

export function calculateTokenCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing: Record<string, { prompt: number; completion: number }> = {
    "gpt-4o": { prompt: 0.5, completion: 1.5 },
    "gpt-4o-mini": { prompt: 0.015, completion: 0.06 },
    "gpt-4-turbo": { prompt: 1.0, completion: 3.0 },
    "claude-3-5-sonnet-20241022": { prompt: 0.3, completion: 1.5 },
    "claude-3-haiku-20240307": { prompt: 0.025, completion: 0.125 },
    "gemini-1.5-pro": { prompt: 0.125, completion: 0.375 },
    "gemini-1.5-flash": { prompt: 0.0075, completion: 0.03 },
  };
  const rates = pricing[model] ?? { prompt: 0.1, completion: 0.1 };
  const costUsd =
    (promptTokens / 1_000_000) * rates.prompt +
    (completionTokens / 1_000_000) * rates.completion;
  return Math.ceil(costUsd * 100);
}
