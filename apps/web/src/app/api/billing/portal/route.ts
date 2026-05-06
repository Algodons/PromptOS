import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@promptos/middleware";
import { stripeService, firebaseService } from "@promptos/services";
import type { JWTPayload } from "@promptos/contracts";

export const POST = withAuth(
  async (_req: NextRequest, user: JWTPayload): Promise<NextResponse> => {
    const userData = await firebaseService.getDocument<{ stripeCustomerId?: string }>(
      "users",
      user.sub
    );

    if (!userData?.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account found" }, { status: 404 });
    }

    const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
    const portalUrl = await stripeService.createPortalSession(
      userData.stripeCustomerId,
      `${appUrl}/billing`
    );

    return NextResponse.json({ url: portalUrl });
  }
);
