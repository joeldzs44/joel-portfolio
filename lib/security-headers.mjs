// Applied by next.config.mjs headers(), so Vercel serves them from the edge without running any code per request.

function supabaseOrigin() {
  try {
    return process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : "";
  } catch {
    return "";
  }
}

// Hot reload in development needs eval; production doesn't.
function csp() {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"} https://vercel.live https://*.vercel-scripts.com https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    `img-src 'self' blob: data: ${supabaseOrigin()}`.trim(),
    "connect-src 'self' https://*.vercel-analytics.com https://vitals.vercel-insights.com",
    // Vercel's toolbar frames vercel.live on preview deployments; production stays closed to it.
    `frame-src https://challenges.cloudflare.com${process.env.VERCEL_ENV === "production" ? "" : " https://vercel.live"}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

/** @returns {{ key: string; value: string }[]} */
export function securityHeaders() {
  return [
    { key: "Content-Security-Policy", value: csp() },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ];
}
