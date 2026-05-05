import { z } from "zod";
import { SubscriptionTier } from "./billing.contract.js";

export const PluginCategory = {
  AI_ENHANCER: "ai_enhancer",
  DATA_SOURCE: "data_source",
  EXPORTER: "exporter",
  AUTOMATION: "automation",
  INTEGRATION: "integration",
  ANALYTICS: "analytics",
} as const;
export type PluginCategory = (typeof PluginCategory)[keyof typeof PluginCategory];

export const PluginPermission = {
  READ_PROMPTS: "read:prompts",
  WRITE_PROMPTS: "write:prompts",
  CALL_AI: "call:ai",
  READ_FILES: "read:files",
  WRITE_FILES: "write:files",
  NETWORK_ACCESS: "network:access",
  USER_DATA: "user:data",
} as const;
export type PluginPermission = (typeof PluginPermission)[keyof typeof PluginPermission];

export const PluginManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().max(500),
  author: z.string(),
  category: z.nativeEnum(PluginCategory),
  permissions: z.array(z.nativeEnum(PluginPermission)),
  requiredTier: z.nativeEnum(SubscriptionTier),
  homepage: z.string().url().optional(),
  iconUrl: z.string().url().optional(),
  entryPoint: z.string(),
  hooks: z.object({
    onInstall: z.boolean().default(false),
    onUninstall: z.boolean().default(false),
    onPromptCreate: z.boolean().default(false),
    onPromptOptimize: z.boolean().default(false),
    onAIRequest: z.boolean().default(false),
    onAIResponse: z.boolean().default(false),
  }),
  config: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        type: z.enum(["string", "number", "boolean", "secret"]),
        required: z.boolean(),
        default: z.unknown().optional(),
      })
    )
    .default([]),
});
export type PluginManifest = z.infer<typeof PluginManifestSchema>;

export const PluginInstallationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  pluginId: z.string(),
  manifest: PluginManifestSchema,
  config: z.record(z.unknown()).default({}),
  enabled: z.boolean().default(true),
  installedAt: z.date(),
  updatedAt: z.date(),
});
export type PluginInstallation = z.infer<typeof PluginInstallationSchema>;

export const PluginExecutionContextSchema = z.object({
  pluginId: z.string(),
  userId: z.string().uuid(),
  hook: z.string(),
  payload: z.record(z.unknown()),
  config: z.record(z.unknown()),
  timeoutMs: z.number().default(5_000),
});
export type PluginExecutionContext = z.infer<typeof PluginExecutionContextSchema>;

export const PluginExecutionResultSchema = z.object({
  success: z.boolean(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  durationMs: z.number(),
});
export type PluginExecutionResult = z.infer<typeof PluginExecutionResultSchema>;

export interface PluginHookHandlers {
  onInstall?(context: PluginExecutionContext): Promise<void>;
  onUninstall?(context: PluginExecutionContext): Promise<void>;
  onPromptCreate?(
    context: PluginExecutionContext
  ): Promise<{ prompt?: string }>;
  onPromptOptimize?(
    context: PluginExecutionContext
  ): Promise<{ optimizedPrompt?: string }>;
  onAIRequest?(
    context: PluginExecutionContext
  ): Promise<{ messages?: unknown[] }>;
  onAIResponse?(
    context: PluginExecutionContext
  ): Promise<{ content?: string }>;
}
