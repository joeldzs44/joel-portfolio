import { ADMIN_COOKIE, ADMIN_TTL } from "@/lib/server/admin";
import { getServerEnv } from "@/lib/server/env";
import { hitRateLimit } from "@/lib/server/rate-limit";
import { ipKey, isSameOrigin, json } from "@/lib/server/request";
import { safeEqual, signToken } from "@/lib/server/signed-token";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const env = getServerEnv();
  if (!env.adminSecret || !env.sessionSecret) return json({ error: "Admin isn't configured." }, 503);

  // Per connection, plus a cap across all connections against distributed guessing.
  const allowed =
    (await hitRateLimit(`admin-login:${ipKey(req, env.ipSalt)}`, 900, 5)) && (await hitRateLimit("admin-login:global", 3600, 20));
  if (!allowed) return json({ error: "Too many attempts. Wait 15 minutes." }, 429);

  const { secret } = (await req.json().catch(() => ({}))) as { secret?: unknown };
  // Pasted secrets often carry a stray space or line break.
  if (typeof secret !== "string" || !safeEqual(secret.trim(), env.adminSecret)) return json({ error: "That secret isn't right." }, 401);

  const response = json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${signToken("admin", ADMIN_TTL, env.sessionSecret)}; Path=/; Max-Age=${ADMIN_TTL}; HttpOnly; Secure; SameSite=Strict`,
  );
  return response;
}
