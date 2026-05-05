import { type NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { SubscriptionTier, TierLimits } from "@promptos/contracts";
import type { JWTPayload } from "@promptos/contracts";
import { withAuth } from "./auth.middleware.js";

function createRedis(): Redis | null {
  const url = process.env["UPSTASH_REDIS_REST_URL"];
  const token = process.env["UPSTASH_REDIS_REST_TOKEN"];
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getRateLimiter(tier: SubscriptionTier): Ratelimit | null {
  const redis = createRedis();
  if (!redis) return null;

  const limits = TierLimits[tier].rateLimit;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limits.requests, `${limits.windowSeconds}s`),
    analytics: true,
    prefix: `promptos:rl:${tier}`,
  });
}

export function withRateLimit(
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(async (req, user) => {
    const limiter = getRateLimiter(user.tier);

    if (limiter) {
      const { success, remaining, reset, limit } = await limiter.limit(user.sub);

      if (!success) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            tier: user.tier,
            retryAfter: Math.ceil((reset - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": String(remaining),
              "X-RateLimit-Reset": String(reset),
              "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
            },
          }
        );
      }
    }

    return handler(req, user);
  });
}

export function withUsageTracking(
  metricType: "prompts" | "api_calls",
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(async (req, user) => {
    const redis = createRedis();
    if (redis) {
      const periodKey = getPeriodKey();
      const usageKey = `promptos:usage:${user.sub}:${metricType}:${periodKey}`;
      const currentUsage = (await redis.get<number>(usageKey)) ?? 0;

      const limits = TierLimits[user.tier];
      const limit =
        metricType === "prompts" ? limits.monthlyPrompts : -1;

      if (limit !== -1 && currentUsage >= limit) {
        return NextResponse.json(
          {
            error: `Monthly ${metricType} limit exceeded`,
            limit,
            used: currentUsage,
            tier: user.tier,
            upgradeUrl: "/billing/upgrade",
          },
          { status: 429 }
        );
      }
    }

    const response = await handler(req, user);

    if (redis && response.status < 400) {
      const periodKey = getPeriodKey();
      const usageKey = `promptos:usage:${user.sub}:${metricType}:${periodKey}`;
      const ttl = getSecondsUntilEndOfMonth();
      await redis.incr(usageKey);
      await redis.expire(usageKey, ttl);
    }

    return response;
  });
}

function getPeriodKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getSecondsUntilEndOfMonth(): number {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((endOfMonth.getTime() - now.getTime()) / 1000);
}
