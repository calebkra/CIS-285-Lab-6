import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Dev containers / GitHub Codespaces forward ports through a proxy, so the
      // browser Origin (…app.github.dev) differs from the Host the server sees.
      allowedOrigins: ["localhost:3000", "*.app.github.dev"],
    },
  },
};

export default nextConfig;
