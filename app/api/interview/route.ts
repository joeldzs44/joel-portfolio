import { cookies } from "next/headers";
import { INTERVIEW_LIMITS, REFUSAL, looksLikeInjection, signAnswer, validateInterviewRequest } from "@/lib/interview/guard";
import { cacheKey, cacheable, getCached, putCached } from "@/lib/interview/cache";
import { buildProfile } from "@/lib/interview/profile";
import { streamCompletion } from "@/lib/interview/openrouter";
import { CUT_OFF, signatureMarker } from "@/lib/interview/transcript";
import { getServerEnv } from "@/lib/server/env";
import { hitRateLimit } from "@/lib/server/rate-limit";
import { clientIp, ipKey, isSameOrigin, json } from "@/lib/server/request";
import { signToken, verifyToken } from "@/lib/server/signed-token";
import { verifyTurnstile } from "@/lib/server/turnstile";

export const runtime = "nodejs";
export const maxDuration = 30;

const SESSION_COOKIE = "iv_session";
const SESSION_TTL = 30 * 60;

const HOUR = 3600;
const DAY = 86400;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const env = getServerEnv();
  if (!env.openrouter || !env.sessionSecret) return json({ error: "The interview isn't available right now." }, 503);

  const raw = await req.text();
  if (raw.length > INTERVIEW_LIMITS.payloadBytes) return json({ error: "That conversation is too long. Start a new one." }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Ask a question to start." }, 400);
  }
  const secret = env.sessionSecret;
  const request = validateInterviewRequest(body, secret);
  if (!request.ok) return json({ error: request.error }, 400);

  // Bot check once per session, then a signed cookie covers the next 30 minutes
  // from the same connection, so one solved check can't be shared across IPs.
  const visitor = ipKey(req, env.ipSalt);
  const jar = await cookies();
  let newSession: string | undefined;
  if (!verifyToken("interview", jar.get(SESSION_COOKIE)?.value, secret, Date.now(), visitor)) {
    if (!(await verifyTurnstile(request.turnstileToken, clientIp(req)))) return json({ error: "verify" }, 401);
    newSession = signToken("interview", SESSION_TTL, secret, Date.now(), visitor);
  }

  const allowed =
    (await hitRateLimit(`iv:h:${visitor}`, HOUR, 20)) &&
    (await hitRateLimit(`iv:d:${visitor}`, DAY, 60)) &&
    (await hitRateLimit("iv:global", DAY, 1500));
  if (!allowed) return json({ error: "You've reached the question limit for now. Try again later, or use the contact form." }, 429);

  const headers: Record<string, string> = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };
  const respond = (stream: ReadableStream<Uint8Array>, cache: "hit" | "miss" | "skip") => {
    const response = new Response(stream, { headers: { ...headers, "x-cache": cache } });
    if (newSession) {
      response.headers.append(
        "Set-Cookie",
        `${SESSION_COOKIE}=${newSession}; Path=/api/interview; Max-Age=${SESSION_TTL}; HttpOnly; Secure; SameSite=Strict`,
      );
    }
    return response;
  };
  const encoder = new TextEncoder();
  const fixed = (text: string) =>
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    });

  const question = request.messages.at(-1)!.content;
  const signed = (answer: string) => answer + signatureMarker(signAnswer(question, answer, secret));
  if (looksLikeInjection(question)) return respond(fixed(signed(REFUSAL)), "skip");

  const profile = await buildProfile();
  const firstQuestion = request.messages.length === 1;
  const key = firstQuestion ? cacheKey(profile.hash, env.openrouter.model, question) : null;
  if (key) {
    const cached = await getCached(key).catch(() => null);
    if (cached) return respond(fixed(signed(cached)), "hit");
  }

  const config = { ...env.openrouter, siteUrl: env.siteUrl };
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let text = "";
      let finishReason: string | null = null;
      try {
        const completion = streamCompletion(request.messages, profile.prompt, config, req.signal);
        for (;;) {
          const next = await completion.next();
          if (next.done) {
            finishReason = next.value.finishReason;
            break;
          }
          text += next.value;
          controller.enqueue(encoder.encode(next.value));
        }
        const complete = cacheable({ finishReason, text, refused: false });
        // Written before the stream closes: serverless functions may stop once the response ends.
        if (key && complete) await putCached(key, text, profile.hash).catch(() => {});
        // The text has already streamed; finish with its signature, or mark it cut off.
        controller.enqueue(encoder.encode(complete ? signatureMarker(signAnswer(question, text, secret)) : CUT_OFF));
      } catch (error) {
        console.error("interview", error instanceof Error ? error.message : error);
        controller.enqueue(encoder.encode(text ? CUT_OFF : "Sorry — I couldn't answer that just now. Try again in a moment."));
      } finally {
        controller.close();
      }
    },
  });
  return respond(stream, key ? "miss" : "skip");
}
