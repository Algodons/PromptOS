import { z } from "zod";

export const SyncStatus = {
  PENDING: "pending",
  SYNCING: "syncing",
  SYNCED: "synced",
  CONFLICT: "conflict",
  ERROR: "error",
} as const;
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus];

export const SyncOperation = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
} as const;
export type SyncOperation = (typeof SyncOperation)[keyof typeof SyncOperation];

export const SyncableEntitySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  entityType: z.string(),
  localVersion: z.number().int().nonnegative(),
  serverVersion: z.number().int().nonnegative(),
  syncStatus: z.nativeEnum(SyncStatus),
  lastSyncedAt: z.date().optional(),
  localUpdatedAt: z.date(),
  serverUpdatedAt: z.date().optional(),
  isDeleted: z.boolean().default(false),
  data: z.record(z.unknown()),
  checksum: z.string().optional(),
});
export type SyncableEntity = z.infer<typeof SyncableEntitySchema>;

export const SyncQueueItemSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  entityId: z.string().uuid(),
  entityType: z.string(),
  operation: z.nativeEnum(SyncOperation),
  payload: z.record(z.unknown()),
  retryCount: z.number().int().nonnegative().default(0),
  maxRetries: z.number().int().positive().default(3),
  createdAt: z.date(),
  scheduledAt: z.date(),
  processedAt: z.date().optional(),
  error: z.string().optional(),
});
export type SyncQueueItem = z.infer<typeof SyncQueueItemSchema>;

export const SyncPushRequestSchema = z.object({
  userId: z.string().uuid(),
  deviceId: z.string(),
  changes: z.array(
    z.object({
      entityId: z.string().uuid(),
      entityType: z.string(),
      operation: z.nativeEnum(SyncOperation),
      data: z.record(z.unknown()),
      localVersion: z.number().int(),
      localUpdatedAt: z.date(),
    })
  ),
  lastSyncedAt: z.date().optional(),
});
export type SyncPushRequest = z.infer<typeof SyncPushRequestSchema>;

export const SyncPullResponseSchema = z.object({
  changes: z.array(SyncableEntitySchema),
  serverTimestamp: z.date(),
  hasMore: z.boolean(),
  nextCursor: z.string().optional(),
});
export type SyncPullResponse = z.infer<typeof SyncPullResponseSchema>;

export const ConflictResolutionSchema = z.object({
  entityId: z.string().uuid(),
  strategy: z.enum(["client_wins", "server_wins", "merge", "manual"]),
  resolvedData: z.record(z.unknown()).optional(),
  resolvedAt: z.date(),
  resolvedBy: z.string().uuid().optional(),
});
export type ConflictResolution = z.infer<typeof ConflictResolutionSchema>;
