import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@promptos/middleware";
import { pluginEngine, firebaseService } from "@promptos/services";
import { z } from "zod";
import type { JWTPayload } from "@promptos/contracts";

const UninstallSchema = z.object({ pluginId: z.string() });

export const DELETE = withAuth(
  async (req: NextRequest, user: JWTPayload): Promise<NextResponse> => {
    const body: unknown = await req.json();
    const parsed = UninstallSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Missing pluginId" }, { status: 400 });
    }

    await pluginEngine.uninstallPlugin(user.sub, parsed.data.pluginId);
    await firebaseService.deleteDocument(`users/${user.sub}/plugins`, parsed.data.pluginId);
    return NextResponse.json({ message: "Plugin uninstalled" });
  }
);
