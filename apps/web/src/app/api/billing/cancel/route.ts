import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@promptos/middleware";
import { stripeService, firebaseService } from "@promptos/services";
import type { JWTPayload } from "@promptos/contracts";

export const POST = withAuth(
  async (req: NextRequest, user: JWTPayload): Promise<NextResponse> => {
    const userData = await firebaseService.getDocument<{ stripeSubscriptionId?: string }>(
      "subscriptions",
      user.sub
    );

    if (!userData?.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    await stripeService.cancelSubscription(userData.stripeSubscriptionId);
    return NextResponse.json({ message: "Subscription will cancel at period end" });
  }
);
