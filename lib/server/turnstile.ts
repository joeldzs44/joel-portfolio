import "server-only";
import { getServerEnv, isProduction } from "./env";

export async function verifyTurnstile(token: unknown, ip: string) {
  const secret = getServerEnv().turnstileSecret;
  if (!secret) return !isProduction();
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const result = (await res.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}
