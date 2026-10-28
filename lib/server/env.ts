// Server-side configuration. Each feature reads its own group; a group is
// present only when every variable it needs is set, so a half-configured
// feature behaves like an unconfigured one instead of failing mid-request.

const read = (name: string) => process.env[name]?.trim() || undefined;

// Accepts the project URL in any form Supabase shows it (e.g. ".../rest/v1/").
function origin(value: string | undefined) {
  try {
    return value ? new URL(value).origin : undefined;
  } catch {
    return undefined;
  }
}

function group<T extends Record<string, string | undefined>>(values: T) {
  return Object.values(values).every(Boolean) ? (values as { [K in keyof T]: string }) : undefined;
}

export function getServerEnv() {
  return {
    supabase: group({ url: origin(read("SUPABASE_URL")), secretKey: read("SUPABASE_SECRET_KEY") }),
    turnstileSecret: read("TURNSTILE_SECRET_KEY"),
    resend: group({ apiKey: read("RESEND_API_KEY"), to: read("CONTACT_TO_EMAIL"), from: read("CONTACT_FROM_EMAIL") }),
    openrouter: group({ apiKey: read("OPENROUTER_API_KEY"), model: read("OPENROUTER_MODEL") ?? "xiaomi/mimo-v2.6-flash" }),
    sessionSecret: read("SESSION_SECRET"),
    ipSalt: read("IP_HASH_SALT"),
    adminSecret: read("ADMIN_SECRET"),
    siteUrl: read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  };
}

export const isProduction = () => process.env.NODE_ENV === "production";
