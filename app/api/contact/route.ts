import { validateContact } from "@/lib/contact";
import { getServerEnv } from "@/lib/server/env";
import { sendEmail } from "@/lib/server/email";
import { hitRateLimit } from "@/lib/server/rate-limit";
import { clientIp, ipKey, isSameOrigin, json } from "@/lib/server/request";
import { verifyTurnstile } from "@/lib/server/turnstile";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const env = getServerEnv();
  if (!env.resend) return json({ error: "Not available right now." }, 503);

  const body = await req.json().catch(() => null);
  // Bots fill the hidden "website" field; pretend success so they move on.
  if (body?.website) return json({ ok: true });

  // Field errors come first so fixing a typo doesn't use up the hourly limit or the bot check.
  const result = validateContact(body);
  if (!result.ok) return json({ errors: result.errors }, 400);

  if (!(await hitRateLimit(`contact:${ipKey(req, env.ipSalt)}`, 3600, 3)))
    return json({ error: "Too many messages from this connection. Try again in an hour." }, 429);
  if (!(await verifyTurnstile(body?.turnstileToken, clientIp(req))))
    return json({ error: "Couldn't verify you're human. Try sending again." }, 400);

  const { name, email, message } = result.value;
  const sent = await sendEmail({
    subject: `Portfolio: message from ${name}`,
    text: `${message}\n\n— ${name} <${email}>`,
    replyTo: email,
  });
  return sent ? json({ ok: true }) : json({ error: "Couldn't send. Try again in a minute." }, 502);
}
