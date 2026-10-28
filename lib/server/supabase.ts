import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "./env";

let client: SupabaseClient | null | undefined;

// Service-role client: server only. Every table has RLS on with no policies,
// so nothing is reachable with the public key.
export function getSupabase() {
  if (client !== undefined) return client;
  const config = getServerEnv().supabase;
  client = config ? createClient(config.url, config.secretKey, { auth: { persistSession: false } }) : null;
  return client;
}
