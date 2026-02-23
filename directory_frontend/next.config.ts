import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We need a serverful Next.js runtime for auth UX (middleware, API routes if needed)
  // and robust file upload/download flows. Static export is too limiting here.
  output: undefined,
  reactStrictMode: true,
};

export default nextConfig;
