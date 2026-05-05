import { type NextRequest, NextResponse } from "next/server";
import { type Permission, type Role, hasPermission } from "@promptos/contracts";
import type { JWTPayload } from "@promptos/contracts";
import { withAuth } from "./auth.middleware.js";

export function withPermission(
  permission: Permission,
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(async (req, user) => {
    if (!hasPermission(user.role as Role, permission)) {
      return NextResponse.json(
        {
          error: "Insufficient permissions",
          required: permission,
          role: user.role,
        },
        { status: 403 }
      );
    }
    return handler(req, user);
  });
}

export function withAnyPermission(
  permissions: Permission[],
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(async (req, user) => {
    const hasAny = permissions.some((p) => hasPermission(user.role as Role, p));
    if (!hasAny) {
      return NextResponse.json(
        {
          error: "Insufficient permissions",
          required: permissions,
          role: user.role,
        },
        { status: 403 }
      );
    }
    return handler(req, user);
  });
}

export function withAllPermissions(
  permissions: Permission[],
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(async (req, user) => {
    const hasAll = permissions.every((p) => hasPermission(user.role as Role, p));
    if (!hasAll) {
      const missing = permissions.filter((p) => !hasPermission(user.role as Role, p));
      return NextResponse.json(
        {
          error: "Insufficient permissions",
          missing,
          role: user.role,
        },
        { status: 403 }
      );
    }
    return handler(req, user);
  });
}

export function withAdminOnly(
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(async (req, user) => {
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    return handler(req, user);
  });
}
