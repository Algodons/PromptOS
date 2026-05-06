import { type NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@promptos/middleware";
import { aiRouterService } from "@promptos/services";
import { AIRequestSchema } from "@promptos/contracts";
import type { JWTPayload } from "@promptos/contracts";

export const POST = withRateLimit(
  async (req: NextRequest, user: JWTPayload): Promise<NextResponse> => {
    const body: unknown = await req.json();
    const parsed = AIRequestSchema.safeParse({ ...(body as object), userId: user.sub });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid AI request", issues: parsed.error.issues }, { status: 400 });
    }

    const result = await aiRouterService.complete(parsed.data);
    return NextResponse.json(result);
  }
);
