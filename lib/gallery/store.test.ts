import { afterEach, describe, expect, it, vi } from "vitest";
import { getApprovedArt } from "./store";

afterEach(() => vi.unstubAllEnvs());

describe("getApprovedArt", () => {
  it("returns an empty gallery when Supabase isn't configured", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    await expect(getApprovedArt()).resolves.toEqual([]);
  });
});
