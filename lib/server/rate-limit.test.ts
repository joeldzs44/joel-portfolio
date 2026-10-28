import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeSupabase } from "./supabase.fake";

const db = vi.hoisted(() => ({ current: null as unknown }));
vi.mock("./supabase", () => ({ getSupabase: () => db.current }));

import { hitRateLimit, windowStart } from "./rate-limit";

afterEach(() => vi.restoreAllMocks());

describe("rate-limit housekeeping", () => {
  it("now and then deletes windows older than two days", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const fake = fakeSupabase({ data: true });
    db.current = fake.client;
    expect(await hitRateLimit("k", 3600, 5)).toBe(true);
    expect(fake.args("from")).toEqual([["rate_hits"]]);
    const [[column, cutoff]] = fake.args("lt");
    expect(column).toBe("window_start");
    expect(Math.abs(Date.parse(String(cutoff)) - (Date.now() - 2 * 86400_000))).toBeLessThan(60_000);
  });

  it("usually skips housekeeping", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const fake = fakeSupabase({ data: true });
    db.current = fake.client;
    await hitRateLimit("k", 3600, 5);
    expect(fake.args("delete")).toEqual([]);
  });
});

describe("windowStart", () => {
  it("floors to the start of the hour", () => {
    expect(windowStart(Date.UTC(2026, 0, 1, 10, 37), 3600)).toBe("2026-01-01T10:00:00.000Z");
  });

  it("floors to the start of the day", () => {
    expect(windowStart(Date.UTC(2026, 0, 1, 10, 37), 86400)).toBe("2026-01-01T00:00:00.000Z");
  });
});
