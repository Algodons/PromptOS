import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRateLimit } from "@promptos/middleware";
import { aiRouterService } from "@promptos/services";
import type { JWTPayload } from "@promptos/contracts";

const OptimizeSchema = z.object({
  prompt: z.string().min(1).max(10_000),
  context: z.string().max(2000).optional(),
  optimizationGoal: z
    .enum(["clarity", "conciseness", "effectiveness", "safety"])
    .default("effectiveness"),
});

export const POST = withRateLimit(
  async (req: NextRequest, user: JWTPayload): Promise<NextResponse> => {
    const body: unknown = await req.json();
    const parsed = OptimizeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    const result = await aiRouterService.optimizePrompt({
      originalPrompt: parsed.data.prompt,
      context: parsed.data.context,
      optimizationGoal: parsed.data.optimizationGoal,
      userId: user.sub,
    });

    return NextResponse.json(result);
  }
);
