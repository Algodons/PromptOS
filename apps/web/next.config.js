/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@promptos/ui",
    "@promptos/contracts",
    "@promptos/middleware",
  ],
  experimental: {
    serverComponentsExternalPackages: [
      "firebase-admin",
      "@anthropic-ai/sdk",
      "stripe",
    ],
  },
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
};

module.exports = nextConfig;
