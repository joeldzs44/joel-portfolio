import { beforeEach, describe, expect, it, vi } from "vitest";

const guards = vi.hoisted(() => ({ hitRateLimit: vi.fn(), verifyTurnstile: vi.fn(), sendEmail: vi.fn() }));

vi.mock("@/lib/server/rate-limit", () => ({ hitRateLimit: guards.hitRateLimit }));
vi.mock("@/lib/server/turnstile", () => ({ verifyTurnstile: guards.verifyTurnstile }));
vi.mock("@/lib/server/email", () => ({ sendEmail: guards.sendEmail }));

import { POST } from "./route";

const request = (body: unknown) =>
  new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { origin: "http://localhost", "content-type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_TO_EMAIL", "to@example.com");
  vi.stubEnv("CONTACT_FROM_EMAIL", "from@example.com");
  guards.hitRateLimit.mockResolvedValue(true);
  guards.verifyTurnstile.mockResolvedValue(true);
  guards.sendEmail.mockResolvedValue(true);
});

describe("contact form", () => {
  it("reports field errors without using up the bot check or the hourly limit", async () => {
    const res = await POST(request({ name: "Ana", email: "not-an-email", message: "Hello there, Joel!", turnstileToken: "tok" }));
    expect(res.status).toBe(400);
    expect((await res.json()).errors.email).toBeTruthy();
    expect(guards.verifyTurnstile).not.toHaveBeenCalled();
    expect(guards.hitRateLimit).not.toHaveBeenCalled();
  });

  it("sends a valid message", async () => {
    const res = await POST(request({ name: "Ana", email: "ana@example.com", message: "Hello there, Joel!", turnstileToken: "tok" }));
    expect(res.status).toBe(200);
    expect(guards.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ replyTo: "ana@example.com" }));
  });
});
