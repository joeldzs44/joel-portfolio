import { describe, expect, it } from "vitest";
import { cacheKey, cacheable, normalizeQuestion } from "./cache";

describe("normalizeQuestion", () => {
  it("lowercases, trims, collapses whitespace and strips trailing punctuation", () => {
    expect(normalizeQuestion("  Is Joel OPEN to   remote work?? ")).toBe("is joel open to remote work");
  });
});

describe("cacheKey", () => {
  it("gives the same key for the same question asked differently", () => {
    expect(cacheKey("p1", "m", "Is Joel open to remote work?")).toBe(cacheKey("p1", "m", "  is joel open to remote WORK "));
  });

  it("changes when the profile changes", () => {
    expect(cacheKey("p1", "m", "Hi")).not.toBe(cacheKey("p2", "m", "Hi"));
  });

  it("changes when the model changes", () => {
    expect(cacheKey("p1", "a", "Hi")).not.toBe(cacheKey("p1", "b", "Hi"));
  });
});

describe("cacheable", () => {
  it("rejects a truncated answer", () => {
    expect(cacheable({ finishReason: "length", text: "x", refused: false })).toBe(false);
  });

  it("rejects an empty answer", () => {
    expect(cacheable({ finishReason: "stop", text: "", refused: false })).toBe(false);
  });

  it("rejects a refusal from the pre-check", () => {
    expect(cacheable({ finishReason: "stop", text: "No.", refused: true })).toBe(false);
  });

  it("rejects a stream that never finished", () => {
    expect(cacheable({ finishReason: null, text: "Partial", refused: false })).toBe(false);
  });

  it("accepts a complete answer", () => {
    expect(cacheable({ finishReason: "stop", text: "Yes.", refused: false })).toBe(true);
  });
});
