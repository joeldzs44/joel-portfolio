import { beforeEach, describe, expect, it, vi } from "vitest";

const guards = vi.hoisted(() => ({ hitRateLimit: vi.fn(), verifyTurnstile: vi.fn(), createPending: vi.fn() }));

vi.mock("@/lib/server/rate-limit", () => ({ hitRateLimit: guards.hitRateLimit }));
vi.mock("@/lib/server/turnstile", () => ({ verifyTurnstile: guards.verifyTurnstile }));
vi.mock("@/lib/server/email", () => ({ sendEmail: async () => true }));
vi.mock("@/lib/gallery/store", () => ({ createPending: guards.createPending }));

import { POST } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SECRET_KEY", "service-key");
  guards.hitRateLimit.mockResolvedValue(true);
  guards.verifyTurnstile.mockResolvedValue(true);
});

describe("gallery submissions", () => {
  it("rejects an invalid drawing without using up the bot check or the hourly limit", async () => {
    const res = await POST(
      new Request("http://localhost/api/gallery", {
        method: "POST",
        headers: { origin: "http://localhost", "content-type": "application/json" },
        body: JSON.stringify({ image: "data:image/png;base64,AAAA", tag: "ship", turnstileToken: "tok" }),
      }),
    );
    expect(res.status).toBe(400);
    expect(guards.verifyTurnstile).not.toHaveBeenCalled();
    expect(guards.hitRateLimit).not.toHaveBeenCalled();
    expect(guards.createPending).not.toHaveBeenCalled();
  });
});
