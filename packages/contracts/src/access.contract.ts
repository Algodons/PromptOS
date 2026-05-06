import { z } from "zod";
import { type FeatureFlag, SubscriptionTier } from "./billing.contract.js";

export const Role = {
  USER: "user",
  PRO_USER: "pro_user",
  ENTERPRISE_USER: "enterprise_user",
  ADMIN: "admin",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const RoleTierMap: Record<Role, SubscriptionTier> = {
  [Role.USER]: SubscriptionTier.FREE,
  [Role.PRO_USER]: SubscriptionTier.PRO,
  [Role.ENTERPRISE_USER]: SubscriptionTier.ENTERPRISE,
  [Role.ADMIN]: SubscriptionTier.ENTERPRISE,
};

export const Permission = {
  READ_PROMPTS: "read:prompts",
  WRITE_PROMPTS: "write:prompts",
  DELETE_PROMPTS: "delete:prompts",
  USE_AI: "use:ai",
  USE_MULTI_MODEL: "use:multi_model",
  INSTALL_PLUGINS: "install:plugins",
  MANAGE_PLUGINS: "manage:plugins",
  VIEW_USAGE: "view:usage",
  MANAGE_BILLING: "manage:billing",
  MANAGE_TEAM: "manage:team",
  ACCESS_API: "access:api",
  ADMIN_PANEL: "admin:panel",
  MANAGE_USERS: "manage:users",
} as const;
export type Permission = (typeof Permission)[keyof typeof Permission];

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.READ_PROMPTS,
    Permission.WRITE_PROMPTS,
    Permission.USE_AI,
    Permission.VIEW_USAGE,
  ],
  [Role.PRO_USER]: [
    Permission.READ_PROMPTS,
    Permission.WRITE_PROMPTS,
    Permission.DELETE_PROMPTS,
    Permission.USE_AI,
    Permission.USE_MULTI_MODEL,
    Permission.INSTALL_PLUGINS,
    Permission.VIEW_USAGE,
    Permission.MANAGE_BILLING,
    Permission.MANAGE_TEAM,
    Permission.ACCESS_API,
  ],
  [Role.ENTERPRISE_USER]: [
    Permission.READ_PROMPTS,
    Permission.WRITE_PROMPTS,
    Permission.DELETE_PROMPTS,
    Permission.USE_AI,
    Permission.USE_MULTI_MODEL,
    Permission.INSTALL_PLUGINS,
    Permission.MANAGE_PLUGINS,
    Permission.VIEW_USAGE,
    Permission.MANAGE_BILLING,
    Permission.MANAGE_TEAM,
    Permission.ACCESS_API,
  ],
  [Role.ADMIN]: Object.values(Permission),
};

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  role: z.nativeEnum(Role),
  avatarUrl: z.string().url().optional(),
  emailVerified: z.boolean().default(false),
  featureFlags: z.custom<FeatureFlag>().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const JWTPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  role: z.nativeEnum(Role),
  tier: z.nativeEnum(SubscriptionTier),
  iat: z.number(),
  exp: z.number(),
  jti: z.string(),
});
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

export const AuthRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type AuthRequest = z.infer<typeof AuthRequestSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
  expiresIn: z.number(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export function hasPermission(role: Role, permission: Permission): boolean {
  return RolePermissions[role].includes(permission);
}

export function hasFeatureAccess(
  featureFlags: FeatureFlag,
  feature: keyof FeatureFlag
): boolean {
  return featureFlags[feature] === true;
}
