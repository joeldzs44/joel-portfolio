import { createHash } from "node:crypto";
import { getSupabase } from "@/lib/server/supabase";

// First questions are answered once and reused until the portfolio content,
// the prompt or the model changes — all three are part of the key.

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
  const { data } = await supabase.from("interview_cache").select("answer, hits").eq("key", key).maybeSingle();
  if (!data) return null;
  void supabase.from("interview_cache").update({ hits: data.hits + 1 }).eq("key", key).then(() => {});
  return data.answer as string;
}

export async function putCached(key: string, answer: string, profileHash: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("interview_cache").upsert({ key, answer, profile_hash: profileHash });
  // Answers written against older content can never be hit again; clear them out.
  await supabase.from("interview_cache").delete().neq("profile_hash", profileHash);
}
