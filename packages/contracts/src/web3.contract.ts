import { z } from "zod";

export const ChainId = {
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BASE: 8453,
} as const;
export type ChainId = (typeof ChainId)[keyof typeof ChainId];

export const Web3AuthRequestSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number(),
  message: z.string(),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  nonce: z.string().uuid(),
});
export type Web3AuthRequest = z.infer<typeof Web3AuthRequestSchema>;

export const NFTAccessTokenSchema = z.object({
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tokenId: z.string(),
  chainId: z.number(),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  metadata: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    attributes: z.array(z.record(z.unknown())).optional(),
  }),
});
export type NFTAccessToken = z.infer<typeof NFTAccessTokenSchema>;

export const Web3SessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number(),
  nftAccess: z.array(NFTAccessTokenSchema).default([]),
  grantedFeatures: z.array(z.string()).default([]),
  connectedAt: z.date(),
  expiresAt: z.date(),
  isActive: z.boolean().default(true),
});
export type Web3Session = z.infer<typeof Web3SessionSchema>;

export const WalletConnectConfigSchema = z.object({
  projectId: z.string(),
  metadata: z.object({
    name: z.string(),
    description: z.string(),
    url: z.string().url(),
    icons: z.array(z.string().url()),
  }),
  chains: z.array(z.number()),
});
export type WalletConnectConfig = z.infer<typeof WalletConnectConfigSchema>;

export const NFTGateConfigSchema = z.object({
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number(),
  requiredBalance: z.number().int().positive().default(1),
  grantedFeatures: z.array(z.string()),
});
export type NFTGateConfig = z.infer<typeof NFTGateConfigSchema>;

export const SignInMessageSchema = z.object({
  domain: z.string(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  statement: z.string(),
  uri: z.string().url(),
  version: z.string(),
  chainId: z.number(),
  nonce: z.string(),
  issuedAt: z.string(),
  expirationTime: z.string().optional(),
});
export type SignInMessage = z.infer<typeof SignInMessageSchema>;
