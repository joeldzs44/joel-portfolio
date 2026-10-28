/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The interview API reads content/ at runtime to build its profile.
  outputFileTracingIncludes: { "/api/interview": ["./content/**/*"] },
  async redirects() {
    return [
      { source: "/blog", destination: "/writing", permanent: true },
      { source: "/blog/:slug", destination: "/writing/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
