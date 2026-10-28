import { beforeEach, describe, expect, it, vi } from "vitest";

const limits = vi.hoisted(() => ({ hitRateLimit: vi.fn() }));
vi.mock("@/lib/server/rate-limit", () => limits);

import { POST } from "./route";

const SECRET = "a".repeat(64);
const login = (secret: unknown) =>
  POST(
    new Request("http://localhost/api/admin/login", {
      method: "POST",
      headers: { origin: "http://localhost", "content-type": "application/json" },
      body: JSON.stringify({ secret }),
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("ADMIN_SECRET", SECRET);
  vi.stubEnv("SESSION_SECRET", "session");
  limits.hitRateLimit.mockResolvedValue(true);
});

describe("admin login", () => {
  it("accepts the secret with whitespace pasted around it", async () => {
    expect((await login(`  ${SECRET}\n`)).status).toBe(200);
  });

  it("rejects a wrong secret", async () => {
    expect((await login("wrong")).status).toBe(401);
  });

  it("also counts attempts across every connection", async () => {
    await login("wrong");
    expect(limits.hitRateLimit).toHaveBeenCalledWith("admin-login:global", 3600, 20);
  });
});
