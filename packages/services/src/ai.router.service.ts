import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import {
  AIProvider,
  AIModel,
  ModelProviderMap,
  type AIRequest,
  type AIResponse,
  type AIRouterConfig,
  type PromptOptimizationRequest,
  type PromptOptimizationResponse,
  calculateTokenCost,
} from "@promptos/contracts";

const openai = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });
const anthropic = new Anthropic({ apiKey: process.env["ANTHROPIC_API_KEY"] });
const googleAI = new GoogleGenerativeAI(process.env["GOOGLE_AI_API_KEY"] ?? "");

const DEFAULT_CONFIG: AIRouterConfig = {
  primaryModel: AIModel.GPT_4O_MINI,
  fallbackModels: [AIModel.CLAUDE_3_HAIKU, AIModel.GEMINI_1_5_FLASH],
  maxRetries: 2,
  timeoutMs: 30_000,
  enableCostTracking: true,
  enableFallback: true,
};

export class AIRouterService {
  private config: AIRouterConfig;
  private totalCostCents = 0;

  constructor(config: Partial<AIRouterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    const modelsToTry = [request.model, ...(this.config.enableFallback ? this.config.fallbackModels : [])];

    let lastError: Error | null = null;
    for (const model of modelsToTry) {
      try {
        const result = await this.callProvider({ ...request, model });
        if (this.config.enableCostTracking) {
          this.totalCostCents += result.costUsdCents;
        }
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (!this.config.enableFallback) break;
      }
    }
    throw lastError ?? new Error("All AI providers failed");
  }

  private async callProvider(request: AIRequest): Promise<AIResponse> {
    const provider = ModelProviderMap[request.model];
    const start = Date.now();

    switch (provider) {
      case AIProvider.OPENAI:
        return this.callOpenAI(request, start);
      case AIProvider.ANTHROPIC:
        return this.callAnthropic(request, start);
      case AIProvider.GOOGLE:
        return this.callGoogle(request, start);
      default:
        throw new Error(`Unknown provider: ${String(provider)}`);
    }
  }

  private async callOpenAI(request: AIRequest, start: number): Promise<AIResponse> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    for (const m of request.messages) {
      messages.push({ role: m.role, content: m.content });
    }

    const completion = await openai.chat.completions.create({
      model: request.model,
      messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      top_p: request.topP,
    });

    const choice = completion.choices[0];
    if (!choice) throw new Error("No completion choice returned");

    const usage = completion.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const cost = calculateTokenCost(request.model, usage.prompt_tokens, usage.completion_tokens);

    return {
      id: completion.id,
      model: request.model,
      provider: AIProvider.OPENAI,
      content: choice.message.content ?? "",
      finishReason: (choice.finish_reason as AIResponse["finishReason"]) ?? "stop",
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
      latencyMs: Date.now() - start,
      costUsdCents: cost,
      requestId: request.requestId,
    };
  }

  private async callAnthropic(request: AIRequest, start: number): Promise<AIResponse> {
    const messages: Anthropic.Messages.MessageParam[] = request.messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" as const : "user" as const,
      content: m.content,
    }));

    const msg = await anthropic.messages.create({
      model: request.model,
      max_tokens: request.maxTokens,
      system: request.systemPrompt,
      messages,
      temperature: request.temperature,
    });

    const inputTokens = msg.usage.input_tokens;
    const outputTokens = msg.usage.output_tokens;
    const cost = calculateTokenCost(request.model, inputTokens, outputTokens);
    const content = msg.content[0];
    const text = content?.type === "text" ? content.text : "";

    return {
      id: msg.id,
      model: request.model,
      provider: AIProvider.ANTHROPIC,
      content: text,
      finishReason: msg.stop_reason === "max_tokens" ? "length" : "stop",
      usage: {
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
      latencyMs: Date.now() - start,
      costUsdCents: cost,
      requestId: request.requestId,
    };
  }

  private async callGoogle(request: AIRequest, start: number): Promise<AIResponse> {
    const genModel = googleAI.getGenerativeModel({ model: request.model });
    const prompt = [
      ...(request.systemPrompt ? [`System: ${request.systemPrompt}`] : []),
      ...request.messages.map((m) => `${m.role}: ${m.content}`),
    ].join("\n\n");

    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const usageMeta = response.usageMetadata ?? { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };
    const cost = calculateTokenCost(
      request.model,
      usageMeta.promptTokenCount ?? 0,
      usageMeta.candidatesTokenCount ?? 0
    );

    return {
      id: uuidv4(),
      model: request.model,
      provider: AIProvider.GOOGLE,
      content: text,
      finishReason: "stop",
      usage: {
        promptTokens: usageMeta.promptTokenCount ?? 0,
        completionTokens: usageMeta.candidatesTokenCount ?? 0,
        totalTokens: usageMeta.totalTokenCount ?? 0,
      },
      latencyMs: Date.now() - start,
      costUsdCents: cost,
      requestId: request.requestId,
    };
  }

  async optimizePrompt(request: PromptOptimizationRequest): Promise<PromptOptimizationResponse> {
    const systemPrompt = `You are an expert prompt engineer. Optimize the given prompt for ${request.optimizationGoal}.
Return a JSON object with: optimizedPrompt (string), improvements (string[]), scoreImprovement (number -100 to 100), tokensReduced (number).`;

    const aiRequest: AIRequest = {
      // Honor targetModel when specified, otherwise fall back to the configured primary model
      model: request.targetModel ?? this.config.primaryModel,
      messages: [
        {
          role: "user",
          content: `Optimize this prompt:\n\n${request.originalPrompt}${request.context ? `\n\nContext: ${request.context}` : ""}`,
        },
      ],
      systemPrompt,
      temperature: 0.3,
      maxTokens: 1024,
      topP: 1,
      stream: false,
      userId: request.userId,
      requestId: uuidv4(),
    };

    const response = await this.complete(aiRequest);
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        originalPrompt: request.originalPrompt,
        optimizedPrompt: response.content,
        improvements: ["AI optimization applied"],
        scoreImprovement: 10,
        tokensReduced: 0,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<PromptOptimizationResponse>;
    return {
      originalPrompt: request.originalPrompt,
      optimizedPrompt: parsed.optimizedPrompt ?? response.content,
      improvements: parsed.improvements ?? [],
      scoreImprovement: parsed.scoreImprovement ?? 0,
      tokensReduced: parsed.tokensReduced ?? 0,
    };
  }

  getTotalCostCents(): number {
    return this.totalCostCents;
  }

  resetCostTracking(): void {
    this.totalCostCents = 0;
  }
}

export const aiRouterService = new AIRouterService();
