import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@promptos/middleware";
import { firebaseService } from "@promptos/services";
import { TierLimits, SubscriptionTier } from "@promptos/contracts";
import type { JWTPayload } from "@promptos/contracts";

export const GET = withAuth(
  async (_req: NextRequest, user: JWTPayload): Promise<NextResponse> => {
    const subData = await firebaseService.getDocument<{ tier: string }>(
      "subscriptions",
      user.sub
    );
    const tier = (subData?.tier as SubscriptionTier) ?? SubscriptionTier.FREE;

    const periodKey = getPeriodKey();
    const usageData = await firebaseService.getDocument<{
      tokensUsed?: number;
      promptsUsed?: number;
    }>(`usage/${user.sub}`, periodKey);

    const limits = TierLimits[tier];
    const tokensUsed = usageData?.tokensUsed ?? 0;
    const promptsUsed = usageData?.promptsUsed ?? 0;

    return NextResponse.json({
      userId: user.sub,
      tier,
      current: { tokensUsed, promptsUsed },
      limits: {
        monthlyTokens: limits.monthlyTokens,
        monthlyPrompts: limits.monthlyPrompts,
      },
      percentages: {
        tokens: limits.monthlyTokens === -1 ? 0 : Math.min((tokensUsed / limits.monthlyTokens) * 100, 100),
        prompts: limits.monthlyPrompts === -1 ? 0 : Math.min((promptsUsed / limits.monthlyPrompts) * 100, 100),
      },
      isOverLimit:
        (limits.monthlyTokens !== -1 && tokensUsed >= limits.monthlyTokens) ||
        (limits.monthlyPrompts !== -1 && promptsUsed >= limits.monthlyPrompts),
    });
  }
);

function getPeriodKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
