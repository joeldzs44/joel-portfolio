import { createPending } from "@/lib/gallery/store";
import { validateSubmission } from "@/lib/gallery/validate";
import { sendEmail } from "@/lib/server/email";
import { getServerEnv } from "@/lib/server/env";
import { hitRateLimit } from "@/lib/server/rate-limit";
import { clientIp, ipKey, isSameOrigin, json } from "@/lib/server/request";
import { verifyTurnstile } from "@/lib/server/turnstile";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const env = getServerEnv();
  if (!env.supabase) return json({ error: "The gallery isn't taking new art right now." }, 503);

  // Validation comes first so a rejected drawing doesn't use up the hourly limit or the bot check.
  const body = await req.json().catch(() => null);
  const result = validateSubmission(body);
  if (!result.ok) return json({ error: result.error }, 400);

  const visitor = ipKey(req, env.ipSalt);
  if (!(await hitRateLimit(`art:${visitor}`, 3600, 5))) return json({ error: "That's a lot of art! Try again in an hour." }, 429);
  if (!(await verifyTurnstile(body?.turnstileToken, clientIp(req))))
    return json({ error: "Couldn't verify you're human. Try sending again." }, 400);

  try {
    await createPending({ ...result.value, ipHash: visitor });
  } catch (error) {
    console.error("gallery", error instanceof Error ? error.message : error);
    return json({ error: "Couldn't save your drawing. Try again in a minute." }, 500);
  }

  const { tag, name, message } = result.value;
  await sendEmail({
    subject: "New art commit waiting for review",
    text: `${tag} from ${name || "someone"}: ${message || "(no message)"}\n\nReview it at ${env.siteUrl}/admin/gallery`,
  });
  return json({ ok: true });
}
