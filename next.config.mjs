import { securityHeaders } from "./lib/security-headers.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The interview API reads content/ at runtime to build its profile.
  outputFileTracingIncludes: { "/api/interview": ["./content/**/*"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders() }];
  },
  async redirects() {
    return [
      { source: "/blog", destination: "/writing", permanent: true },
      { source: "/blog/:slug", destination: "/writing/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
