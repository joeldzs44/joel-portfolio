import "server-only";
import { createHash } from "node:crypto";
import { getSupabase } from "@/lib/server/supabase";

// First questions are answered once and reused for a week, or until the portfolio
// content, the prompt or the model changes — all three are part of the key.

const MAX_AGE_MS = 7 * 86400_000;
const cutoff = () => new Date(Date.now() - MAX_AGE_MS).toISOString();

export function normalizeQuestion(question: string) {
  return question
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\s?!.,;:]+$/, "");
}

export function cacheKey(profileHash: string, model: string, question: string) {
  return createHash("sha256").update(`${profileHash}\n${model}\n${normalizeQuestion(question)}`).digest("hex");
}

export function cacheable({ finishReason, text, refused }: { finishReason: string | null; text: string; refused: boolean }) {
  return finishReason === "stop" && text.trim().length > 0 && !refused;
}

export async function getCached(key: string) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("interview_cache").select("answer, hits").eq("key", key).gt("created_at", cutoff()).maybeSingle();
  if (!data) return null;
  void supabase.from("interview_cache").update({ hits: data.hits + 1 }).eq("key", key).then(() => {});
  return data.answer as string;
}

export async function putCached(key: string, answer: string, profileHash: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("interview_cache").upsert({ key, answer, profile_hash: profileHash, created_at: new Date().toISOString() });
  // Answers for other content versions are cleared once expired; until then a preview
  // and production deployment sharing this database keep each other's entries.
  await supabase.from("interview_cache").delete().neq("profile_hash", profileHash).lt("created_at", cutoff());
}
