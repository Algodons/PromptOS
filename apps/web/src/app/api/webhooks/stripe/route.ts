import { type NextRequest, NextResponse } from "next/server";
import { stripeService, firebaseService } from "@promptos/services";
import { SubscriptionTier, Role, RoleTierMap } from "@promptos/contracts";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  let event;
  try {
    event = await stripeService.constructWebhookEvent(payload, sig);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    const result = await stripeService.handleWebhookEvent(event);

    if (result.userId && result.action !== "unhandled") {
      switch (result.action) {
        case "subscription_created":
        case "subscription_updated": {
          const tier = result.tier ?? SubscriptionTier.FREE;
          const role = Object.entries(RoleTierMap).find(([, t]) => t === tier)?.[0] as Role | undefined;

          await firebaseService.setDocument("subscriptions", result.userId, {
            tier,
            stripeSubscriptionId: result.subscriptionId,
            status: result.status ?? "active",
            updatedAt: new Date(),
          });

          if (role) {
            await firebaseService.setCustomClaims(result.userId, { role, tier });
          }
          break;
        }
        case "subscription_canceled": {
          await firebaseService.setDocument("subscriptions", result.userId, {
            tier: SubscriptionTier.FREE,
            stripeSubscriptionId: null,
            status: "canceled",
            updatedAt: new Date(),
          });
          await firebaseService.setCustomClaims(result.userId, {
            role: Role.USER,
            tier: SubscriptionTier.FREE,
          });
          break;
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
