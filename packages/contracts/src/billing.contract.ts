import { z } from "zod";

export const SubscriptionTier = {
  FREE: "FREE",
  PRO: "PRO",
  ENTERPRISE: "ENTERPRISE",
} as const;
export type SubscriptionTier = (typeof SubscriptionTier)[keyof typeof SubscriptionTier];

export const BillingInterval = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;
export type BillingInterval = (typeof BillingInterval)[keyof typeof BillingInterval];

export const TierLimits: Record<SubscriptionTier, TierLimit> = {
  FREE: {
    monthlyTokens: 100_000,
    monthlyPrompts: 50,
    maxFileSize: 5 * 1024 * 1024,
    maxPlugins: 2,
    maxTeamMembers: 1,
    rateLimit: { requests: 10, windowSeconds: 60 },
  },
  PRO: {
    monthlyTokens: 5_000_000,
    monthlyPrompts: 5_000,
    maxFileSize: 50 * 1024 * 1024,
    maxPlugins: 20,
    maxTeamMembers: 5,
    rateLimit: { requests: 60, windowSeconds: 60 },
  },
  ENTERPRISE: {
    monthlyTokens: -1, // unlimited
    monthlyPrompts: -1,
    maxFileSize: 500 * 1024 * 1024,
    maxPlugins: -1,
    maxTeamMembers: -1,
    rateLimit: { requests: 600, windowSeconds: 60 },
  },
};

export interface TierLimit {
  monthlyTokens: number;
  monthlyPrompts: number;
  maxFileSize: number;
  maxPlugins: number;
  maxTeamMembers: number;
  rateLimit: { requests: number; windowSeconds: number };
}

export const FeatureFlags: Record<SubscriptionTier, FeatureFlag> = {
  FREE: {
    aiRouter: false,
    multiModel: false,
    pluginMarketplace: false,
    teamCollaboration: false,
    promptHistory: true,
    exportMarkdown: false,
    exportPDF: false,
    apiAccess: false,
    prioritySupport: false,
    web3Access: false,
    customModels: false,
    offlineSync: false,
  },
  PRO: {
    aiRouter: true,
    multiModel: true,
    pluginMarketplace: true,
    teamCollaboration: true,
    promptHistory: true,
    exportMarkdown: true,
    exportPDF: true,
    apiAccess: true,
    prioritySupport: true,
    web3Access: true,
    customModels: false,
    offlineSync: true,
  },
  ENTERPRISE: {
    aiRouter: true,
    multiModel: true,
    pluginMarketplace: true,
    teamCollaboration: true,
    promptHistory: true,
    exportMarkdown: true,
    exportPDF: true,
    apiAccess: true,
    prioritySupport: true,
    web3Access: true,
    customModels: true,
    offlineSync: true,
  },
};

export interface FeatureFlag {
  aiRouter: boolean;
  multiModel: boolean;
  pluginMarketplace: boolean;
  teamCollaboration: boolean;
  promptHistory: boolean;
  exportMarkdown: boolean;
  exportPDF: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  web3Access: boolean;
  customModels: boolean;
  offlineSync: boolean;
}

export const SubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tier: z.nativeEnum(SubscriptionTier),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  stripePriceId: z.string().optional(),
  interval: z.nativeEnum(BillingInterval).optional(),
  status: z.enum(["active", "trialing", "past_due", "canceled", "unpaid"]),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const CreateCheckoutSessionSchema = z.object({
  tier: z.nativeEnum(SubscriptionTier),
  interval: z.nativeEnum(BillingInterval),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;

export const WebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({ object: z.record(z.unknown()) }),
  created: z.number(),
});
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
