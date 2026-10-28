import { createHash } from "node:crypto";

export function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

const hashIp = (ip: string, salt: string) => createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);

// Browsers always send Origin on POST; reject requests from other sites.
export function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(req.url).host || new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export const json = (body: unknown, status = 200, init?: ResponseInit) =>
  Response.json(body, { status, ...init, headers: { "Cache-Control": "no-store", ...init?.headers } });

export function ipKey(req: Request, salt: string | undefined) {
  return hashIp(clientIp(req), salt ?? "dev");
}
