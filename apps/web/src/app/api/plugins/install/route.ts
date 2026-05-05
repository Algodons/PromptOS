import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@promptos/middleware";
import { pluginEngine, firebaseService } from "@promptos/services";
import { PluginManifestSchema } from "@promptos/contracts";
import { z } from "zod";
import type { JWTPayload } from "@promptos/contracts";

const InstallSchema = z.object({
  manifest: PluginManifestSchema,
  config: z.record(z.unknown()).default({}),
});

export const POST = withAuth(
  async (req: NextRequest, user: JWTPayload): Promise<NextResponse> => {
    const body: unknown = await req.json();
    const parsed = InstallSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid plugin manifest", issues: parsed.error.issues }, { status: 400 });
    }

    const subData = await firebaseService.getDocument<{ tier: string }>("subscriptions", user.sub);
    const userTier = (subData?.tier as import("@promptos/contracts").SubscriptionTier) ?? "FREE";

    const installation = await pluginEngine.installPlugin(
      user.sub,
      parsed.data.manifest,
      parsed.data.config,
      userTier
    );

    await firebaseService.setDocument(`users/${user.sub}/plugins`, installation.pluginId, installation);
    return NextResponse.json(installation, { status: 201 });
  }
);
