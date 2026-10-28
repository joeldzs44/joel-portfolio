import { describe, expect, it, vi } from "vitest";
import { fakeSupabase } from "@/lib/server/supabase.fake";

const db = vi.hoisted(() => ({ current: null as unknown }));
vi.mock("@/lib/server/supabase", () => ({ getSupabase: () => db.current }));

import { cacheKey, cacheable, getCached, normalizeQuestion, putCached } from "./cache";

const WEEK = 7 * 86400_000;
const isoNear = (ms: number) => (value: unknown) => Math.abs(Date.parse(String(value)) - ms) < 60_000;

describe("cache expiry", () => {
  it("ignores answers older than a week", async () => {
    const fake = fakeSupabase({ data: { answer: "A", hits: 0 } });
    db.current = fake.client;
    await getCached("k");
    const [[column, cutoff]] = fake.args("gt");
    expect(column).toBe("created_at");
    expect(isoNear(Date.now() - WEEK)(cutoff)).toBe(true);
  });

  it("refreshes the timestamp when an answer is written", async () => {
    const fake = fakeSupabase();
    db.current = fake.client;
    await putCached("k", "A", "p1");
    expect(fake.args("upsert")[0][0]).toMatchObject({ key: "k", answer: "A", profile_hash: "p1", created_at: expect.any(String) });
  });

  it("only clears other content versions once they're a week old", async () => {
    const fake = fakeSupabase();
    db.current = fake.client;
    await putCached("k", "A", "p1");
    expect(fake.args("neq")).toEqual([["profile_hash", "p1"]]);
    const [[column, cutoff]] = fake.args("lt");
    expect(column).toBe("created_at");
    expect(isoNear(Date.now() - WEEK)(cutoff)).toBe(true);
  });
});

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
