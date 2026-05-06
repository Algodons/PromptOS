import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@promptos/middleware";
import { stripeService, firebaseService } from "@promptos/services";
import { SubscriptionTier, BillingInterval } from "@promptos/contracts";
import type { JWTPayload } from "@promptos/contracts";

// Only accept tier + interval from the client; success/cancel URLs are always
// generated server-side so clients cannot redirect to arbitrary URLs.
const CheckoutRequestSchema = z.object({
  tier: z.nativeEnum(SubscriptionTier),
  interval: z.nativeEnum(BillingInterval),
});

export const POST = withAuth(
  async (req: NextRequest, user: JWTPayload): Promise<NextResponse> => {
    const body: unknown = await req.json();
    const parsed = CheckoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
    }

    const userData = await firebaseService.getDocument<{ stripeCustomerId?: string }>(
      "users",
      user.sub
    );

    let customerId = userData?.stripeCustomerId;
    if (!customerId) {
      customerId = await stripeService.createCustomer(user.sub, user.email);
      await firebaseService.updateDocument("users", user.sub, { stripeCustomerId: customerId });
    }

    const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
    const checkoutUrl = await stripeService.createCheckoutSession(user.sub, customerId, {
      tier: parsed.data.tier,
      interval: parsed.data.interval,
      successUrl: `${appUrl}/billing/success`,
      cancelUrl: `${appUrl}/billing`,
    });

    return NextResponse.json({ url: checkoutUrl });
  }
);
