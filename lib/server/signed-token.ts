import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless session tokens: "<expiry ms>.<hmac(purpose:subject:expiry)>".
// The optional subject ties a token to one visitor, e.g. a hashed IP.
export type TokenPurpose = "interview" | "admin";

const mac = (purpose: TokenPurpose, subject: string, exp: number, secret: string) =>
  createHmac("sha256", secret).update(`${purpose}:${subject}:${exp}`).digest("base64url");

export function signToken(purpose: TokenPurpose, ttlSec: number, secret: string, now = Date.now(), subject = "") {
  const exp = now + ttlSec * 1000;
  return `${exp}.${mac(purpose, subject, exp, secret)}`;
}

export function verifyToken(purpose: TokenPurpose, token: string | undefined, secret: string, now = Date.now(), subject = "") {
  const [expPart, signature] = token?.split(".") ?? [];
  const exp = Number(expPart);
  if (!signature || !Number.isFinite(exp) || exp < now) return false;
  const expected = Buffer.from(mac(purpose, subject, exp, secret));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function safeEqual(a: string, b: string) {
  const left = createHmac("sha256", "compare").update(a).digest();
  const right = createHmac("sha256", "compare").update(b).digest();
  return timingSafeEqual(left, right);
}
