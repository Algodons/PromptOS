import { type NextRequest, NextResponse } from "next/server";
import { SubscriptionTier, FeatureFlags, type FeatureFlag, TierLimits } from "@promptos/contracts";
import type { JWTPayload } from "@promptos/contracts";
import { withAuth } from "./auth.middleware.js";

export function withBillingTier(
  requiredTier: SubscriptionTier,
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  const tierOrder = [SubscriptionTier.FREE, SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE];

  return withAuth(async (req, user) => {
    const userTierIndex = tierOrder.indexOf(user.tier);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);

    if (userTierIndex < requiredTierIndex) {
      return NextResponse.json(
        {
          error: "Subscription upgrade required",
          requiredTier,
          currentTier: user.tier,
          upgradeUrl: "/billing/upgrade",
        },
        { status: 402 }
      );
    }

    return handler(req, user);
  });
}

export function withFeatureFlag(
  feature: keyof FeatureFlag,
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(async (req, user) => {
    const flags = FeatureFlags[user.tier];
    if (!flags[feature]) {
      return NextResponse.json(
        {
          error: `Feature '${feature}' is not available on your current plan`,
          feature,
          currentTier: user.tier,
          upgradeUrl: "/billing/upgrade",
        },
        { status: 402 }
      );
    }

    return handler(req, user);
  });
}

export function getTierLimits(tier: SubscriptionTier): typeof TierLimits[SubscriptionTier] {
  return TierLimits[tier];
}
