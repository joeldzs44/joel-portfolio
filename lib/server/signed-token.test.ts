import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./signed-token";

const SECRET = "test-secret";
const NOW = Date.UTC(2026, 0, 1);

describe("signed tokens", () => {
  it("verifies a token it signed", () => {
    const token = signToken("interview", 60, SECRET, NOW);
    expect(verifyToken("interview", token, SECRET, NOW + 1000)).toBe(true);
  });

  it("rejects a token signed for another purpose", () => {
    const token = signToken("interview", 60, SECRET, NOW);
    expect(verifyToken("admin", token, SECRET, NOW)).toBe(false);
  });

  it("rejects a tampered signature", () => {
    const token = signToken("admin", 60, SECRET, NOW);
    const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
    expect(verifyToken("admin", tampered, SECRET, NOW)).toBe(false);
  });

  it("rejects a token signed for another subject", () => {
    const token = signToken("interview", 60, SECRET, NOW, "visitor-a");
    expect(verifyToken("interview", token, SECRET, NOW, "visitor-a")).toBe(true);
    expect(verifyToken("interview", token, SECRET, NOW, "visitor-b")).toBe(false);
  });

  it("rejects an expired token", () => {
    const token = signToken("admin", 60, SECRET, NOW);
    expect(verifyToken("admin", token, SECRET, NOW + 61_000)).toBe(false);
  });
});
