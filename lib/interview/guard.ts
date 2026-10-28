import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cleanText } from "@/lib/text";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const INTERVIEW_LIMITS = { messageChars: 500, turns: 8, payloadBytes: 8 * 1024 } as const;

type Result = { ok: true; messages: ChatMessage[]; turnstileToken?: string } | { ok: false; error: string };

// Signs an answer the server gave, bound to the question it answered.
export function signAnswer(question: string, answer: string, secret: string) {
  return createHmac("sha256", secret).update(`answer:${cleanText(question)}
${cleanText(answer)}`).digest("base64url");
}

function isSigned(question: string, answer: string, sig: unknown, secret: string) {
  if (typeof sig !== "string") return false;
  const expected = Buffer.from(signAnswer(question, answer, secret));
  const actual = Buffer.from(sig);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

const BROKEN = "This conversation can't continue. Close the interview and start a new one.";

export function validateInterviewRequest(body: unknown, secret: string): Result {
  const source = (body && typeof body === "object" ? body : {}) as { messages?: unknown; turnstileToken?: unknown };
  if (!Array.isArray(source.messages)) return { ok: false, error: "Ask a question to start." };

  const messages: ChatMessage[] = [];
  for (const raw of source.messages) {
    const role = (raw as { role?: unknown })?.role;
    if (role !== "user" && role !== "assistant") continue;
    const content = cleanText((raw as { content?: unknown }).content);
    // Answers are signed by the server, so only the visitor's questions need a length cap.
    if (role === "user" && content.length > INTERVIEW_LIMITS.messageChars)
      return { ok: false, error: `Keep questions under ${INTERVIEW_LIMITS.messageChars} characters.` };
    if (!content) continue;
    // History alternates question, answer; every answer must be one the server gave to that question.
    if (role !== (messages.length % 2 === 0 ? "user" : "assistant")) return { ok: false, error: BROKEN };
    if (role === "assistant" && !isSigned(messages.at(-1)!.content, content, (raw as { sig?: unknown }).sig, secret))
      return { ok: false, error: BROKEN };
    messages.push({ role, content });
  }

  if (messages.at(-1)?.role !== "user") return { ok: false, error: "Ask a question to start." };
  const recent = messages.slice(-INTERVIEW_LIMITS.turns);
  if (recent[0].role === "assistant") recent.shift();

  const turnstileToken = typeof source.turnstileToken === "string" ? source.turnstileToken : undefined;
  return { ok: true, messages: recent, turnstileToken };
}

// Cheap pre-check for the most common attempts to repurpose the assistant.
// The system prompt is the main defence; this saves a model call on obvious cases.
const INJECTION_PATTERNS = [
  /\b(ignore|disregard|forget|override)\b.{0,40}\b(previous|prior|above|earlier|all|your)\b.{0,20}\b(instructions?|rules|prompts?|directions)/i,
  /\b(system|hidden|initial)\s+prompt\b/i,
  /\byou are now\b/i,
  /\b(DAN|jailbreak|developer mode)\b/i,
  /\bpretend (to be|you are)\b/i,
];

export function looksLikeInjection(text: string) {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

export const REFUSAL =
  "I can only answer questions about Joel — his work, skills, experience and availability. What would you like to know?";
