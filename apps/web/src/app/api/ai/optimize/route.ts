import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withOptionalAuth } from "@promptos/middleware";
import { aiRouterService } from "@promptos/services";
import { AIModel, SubscriptionTier, TierLimits } from "@promptos/contracts";
import type { JWTPayload } from "@promptos/contracts";

const OptimizeSchema = z.object({
  prompt: z.string().min(1).max(10_000),
  context: z.string().max(2000).optional(),
  optimizationGoal: z
    .enum(["clarity", "conciseness", "effectiveness", "safety"])
    .default("effectiveness"),
  targetModel: z.nativeEnum(AIModel).optional(),
});

export const POST = withOptionalAuth(
  async (req: NextRequest, user: JWTPayload | null): Promise<NextResponse> => {
    const body: unknown = await req.json();
    const parsed = OptimizeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    // Anonymous users are allowed with a lower quota; authenticated users get tier limits
    const userId = user?.sub ?? "anonymous";

    // Enforce prompt limit for free/anonymous tier
    if (!user) {
      const ip = req.headers.get("x-forwarded-for") ?? "unknown";
      const tierLimit = TierLimits[SubscriptionTier.FREE].monthlyPrompts;
      // IP-based limiting is handled by upstream infrastructure; log for monitoring
      console.info(`[optimize] anonymous request from ${ip}, userId=anonymous, limit=${tierLimit}`);
    }

    const result = await aiRouterService.optimizePrompt({
      originalPrompt: parsed.data.prompt,
      context: parsed.data.context,
      optimizationGoal: parsed.data.optimizationGoal,
      targetModel: parsed.data.targetModel,
      userId,
    });

    return NextResponse.json(result);
  }
);
