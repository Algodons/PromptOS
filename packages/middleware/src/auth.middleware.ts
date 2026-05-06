import jwt, { type SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { type NextRequest, NextResponse } from "next/server";
import { JWTPayloadSchema, type JWTPayload } from "@promptos/contracts";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "";
const JWT_EXPIRES_IN = (process.env["JWT_EXPIRES_IN"] ?? "7d") as SignOptions["expiresIn"];

function requireJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error(
      "JWT_SECRET environment variable is not set. Set it to a secure random string before starting the server."
    );
  }
  return JWT_SECRET;
}

export function signToken(payload: Omit<JWTPayload, "iat" | "exp" | "jti">): string {
  return jwt.sign({ ...payload, jti: uuidv4() }, requireJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, requireJwtSecret(), { algorithms: ["HS256"] });
  return JWTPayloadSchema.parse(decoded);
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export type AuthenticatedRequest = NextRequest & {
  user: JWTPayload;
};

export function withAuth(
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const token = extractBearerToken(req.headers.get("authorization"));
      if (!token) {
        return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
      }

      let payload: JWTPayload;
      try {
        payload = verifyToken(token);
      } catch {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
      }

      return handler(req, payload);
    } catch {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

export function withOptionalAuth(
  handler: (req: NextRequest, user: JWTPayload | null) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    const token = extractBearerToken(req.headers.get("authorization"));
    let user: JWTPayload | null = null;

    if (token) {
      try {
        user = verifyToken(token);
      } catch {
        // Silently ignore invalid tokens for optional auth
      }
    }

    return handler(req, user);
  };
}
