import { afterEach, describe, expect, it, vi } from "vitest";
import { getServerEnv } from "./env";

afterEach(() => vi.unstubAllEnvs());

describe("getServerEnv", () => {
  it("omits a group when only some of its variables are set", () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    expect(getServerEnv().supabase).toBeUndefined();
  });

  it("includes a group when all of its variables are set", () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "key");
    expect(getServerEnv().supabase).toEqual({ url: "https://x.supabase.co", secretKey: "key" });
  });

  it("uses the project root when the Supabase URL is the REST endpoint", () => {
    vi.stubEnv("SUPABASE_URL", "https://x.supabase.co/rest/v1/");
    vi.stubEnv("SUPABASE_SECRET_KEY", "key");
    expect(getServerEnv().supabase?.url).toBe("https://x.supabase.co");
  });
});
