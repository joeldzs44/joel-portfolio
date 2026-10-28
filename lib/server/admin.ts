import { cookies } from "next/headers";
import { getServerEnv } from "./env";
import { verifyToken } from "./signed-token";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_TTL = 8 * 60 * 60;

export async function isAdmin() {
  const secret = getServerEnv().sessionSecret;
  if (!secret) return false;
  const jar = await cookies();
  return verifyToken("admin", jar.get(ADMIN_COOKIE)?.value, secret);
}
