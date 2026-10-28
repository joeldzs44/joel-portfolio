import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeSupabase } from "@/lib/server/supabase.fake";

const db = vi.hoisted(() => ({ current: undefined as unknown }));
vi.mock("@/lib/server/supabase", async (actual) => {
  const real = await actual<typeof import("@/lib/server/supabase")>();
  return { getSupabase: () => db.current ?? real.getSupabase() };
});

import { approve, getApprovedArt } from "./store";

describe("approve", () => {
  it("publishes with a short cache lifetime so deletions take effect quickly", async () => {
    const fake = fakeSupabase({ data: { id: "a1", status: "pending", image_path: "pending/a1.png" } });
    db.current = fake.client;
    await approve("a1");
    const [path, , options] = fake.args("upload")[0];
    expect(path).toBe("approved/a1.png");
    expect(options).toMatchObject({ cacheControl: "60" });
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  db.current = undefined;
});

describe("getApprovedArt", () => {
  it("returns an empty gallery when Supabase isn't configured", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    await expect(getApprovedArt()).resolves.toEqual([]);
  });
});
