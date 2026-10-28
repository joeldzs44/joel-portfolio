import "server-only";
import { isProduction } from "./env";
import { getSupabase } from "./supabase";

// Fixed-window counters stored in Supabase so every serverless instance shares them.
export function windowStart(nowMs: number, windowSec: number) {
  const size = windowSec * 1000;
  return new Date(Math.floor(nowMs / size) * size).toISOString();
}

// Resolves true when the request is allowed.
export async function hitRateLimit(key: string, windowSec: number, max: number) {
  const supabase = getSupabase();
  // Without a store, allow in development and refuse in production.
  if (!supabase) return !isProduction();
  const { data, error } = await supabase.rpc("hit_rate_limit", {
    p_key: key,
    p_window_start: windowStart(Date.now(), windowSec),
    p_max: max,
  });
  if (error) {
    console.error("rate limit", error.message);
    return false;
  }
  // About one request in a hundred clears windows older than two days.
  if (Math.random() < 0.01) {
    const old = new Date(Date.now() - 2 * 86400_000).toISOString();
    await supabase.from("rate_hits").delete().lt("window_start", old);
  }
  return data === true;
}
