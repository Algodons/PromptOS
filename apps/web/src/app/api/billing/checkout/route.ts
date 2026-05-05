import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@promptos/middleware";
import { stripeService, firebaseService } from "@promptos/services";
import { CreateCheckoutSessionSchema } from "@promptos/contracts";
import type { JWTPayload } from "@promptos/contracts";

export const POST = withAuth(
  async (req: NextRequest, user: JWTPayload): Promise<NextResponse> => {
    const body: unknown = await req.json();
    const parsed = CreateCheckoutSessionSchema.safeParse(body);

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
      ...parsed.data,
      successUrl: `${appUrl}/billing/success`,
      cancelUrl: `${appUrl}/billing`,
    });

    return NextResponse.json({ url: checkoutUrl });
  }
);
