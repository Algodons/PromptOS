import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ENCRYPTION_KEY: z.string().min(32),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  STRIPE_PRICE_PRO_MONTHLY: z.string(),
  STRIPE_PRICE_PRO_YEARLY: z.string(),
  STRIPE_PRICE_ENTERPRISE_MONTHLY: z.string(),
  STRIPE_PRICE_ENTERPRISE_YEARLY: z.string(),

  // AI
  OPENAI_API_KEY: z.string().startsWith("sk-"),
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-"),
  GOOGLE_AI_API_KEY: z.string(),

  // Firebase
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string(),

  // WalletConnect
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().optional(),
  NFT_CONTRACT_ADDRESS: z.string().optional(),

  // Rate Limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;

  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  _env = parsed.data;
  return _env;
}

export function getPublicEnv() {
  return {
    appUrl: process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000",
    firebaseApiKey: process.env["NEXT_PUBLIC_FIREBASE_API_KEY"] ?? "",
    firebaseAuthDomain: process.env["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"] ?? "",
    firebaseDatabaseUrl: process.env["NEXT_PUBLIC_FIREBASE_DATABASE_URL"] ?? "",
    firebaseStorageBucket: process.env["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"] ?? "",
    firebaseMessagingSenderId: process.env["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"] ?? "",
    firebaseAppId: process.env["NEXT_PUBLIC_FIREBASE_APP_ID"] ?? "",
    walletConnectProjectId: process.env["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"] ?? "",
    stripePublishableKey: process.env["STRIPE_PUBLISHABLE_KEY"] ?? "",
  };
}
