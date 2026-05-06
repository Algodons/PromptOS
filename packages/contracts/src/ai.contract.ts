import { z } from "zod";

export const AIProvider = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GOOGLE: "google",
} as const;
export type AIProvider = (typeof AIProvider)[keyof typeof AIProvider];

export const AIModel = {
  GPT_4O: "gpt-4o",
  GPT_4O_MINI: "gpt-4o-mini",
  GPT_4_TURBO: "gpt-4-turbo",
  CLAUDE_3_5_SONNET: "claude-3-5-sonnet-20241022",
  CLAUDE_3_HAIKU: "claude-3-haiku-20240307",
  CLAUDE_3_OPUS: "claude-3-opus-20240229",
  GEMINI_1_5_PRO: "gemini-1.5-pro",
  GEMINI_1_5_FLASH: "gemini-1.5-flash",
} as const;
export type AIModel = (typeof AIModel)[keyof typeof AIModel];

export const ModelProviderMap: Record<AIModel, AIProvider> = {
  [AIModel.GPT_4O]: AIProvider.OPENAI,
  [AIModel.GPT_4O_MINI]: AIProvider.OPENAI,
  [AIModel.GPT_4_TURBO]: AIProvider.OPENAI,
  [AIModel.CLAUDE_3_5_SONNET]: AIProvider.ANTHROPIC,
  [AIModel.CLAUDE_3_HAIKU]: AIProvider.ANTHROPIC,
  [AIModel.CLAUDE_3_OPUS]: AIProvider.ANTHROPIC,
  [AIModel.GEMINI_1_5_PRO]: AIProvider.GOOGLE,
  [AIModel.GEMINI_1_5_FLASH]: AIProvider.GOOGLE,
};

export const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});
export type Message = z.infer<typeof MessageSchema>;

export const AIRequestSchema = z.object({
  model: z.nativeEnum(AIModel),
  messages: z.array(MessageSchema).min(1),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().max(128_000).default(2048),
  topP: z.number().min(0).max(1).default(1),
  stream: z.boolean().default(false),
  systemPrompt: z.string().optional(),
  userId: z.string().uuid(),
  requestId: z.string().uuid(),
});
export type AIRequest = z.infer<typeof AIRequestSchema>;

export const AIResponseSchema = z.object({
  id: z.string(),
  model: z.nativeEnum(AIModel),
  provider: z.nativeEnum(AIProvider),
  content: z.string(),
  finishReason: z.enum(["stop", "length", "content_filter", "error"]),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }),
  latencyMs: z.number(),
  costUsdCents: z.number(),
  requestId: z.string(),
});
export type AIResponse = z.infer<typeof AIResponseSchema>;

export const AIRouterConfigSchema = z.object({
  primaryModel: z.nativeEnum(AIModel),
  fallbackModels: z.array(z.nativeEnum(AIModel)),
  maxRetries: z.number().int().min(0).max(5).default(2),
  timeoutMs: z.number().int().positive().default(30_000),
  enableCostTracking: z.boolean().default(true),
  enableFallback: z.boolean().default(true),
});
export type AIRouterConfig = z.infer<typeof AIRouterConfigSchema>;

export const PromptOptimizationRequestSchema = z.object({
  originalPrompt: z.string().min(1),
  context: z.string().optional(),
  targetModel: z.nativeEnum(AIModel).optional(),
  optimizationGoal: z
    .enum(["clarity", "conciseness", "effectiveness", "safety"])
    .default("effectiveness"),
  userId: z.string().uuid(),
});
export type PromptOptimizationRequest = z.infer<typeof PromptOptimizationRequestSchema>;

export const PromptOptimizationResponseSchema = z.object({
  originalPrompt: z.string(),
  optimizedPrompt: z.string(),
  improvements: z.array(z.string()),
  scoreImprovement: z.number().min(-100).max(100),
  tokensReduced: z.number(),
});
export type PromptOptimizationResponse = z.infer<typeof PromptOptimizationResponseSchema>;

export interface AIProviderAdapter {
  complete(request: AIRequest): Promise<AIResponse>;
  countTokens(text: string, model: AIModel): Promise<number>;
  isAvailable(): Promise<boolean>;
}
