import { describe, expect, it } from "vitest";
import { windowStart } from "./rate-limit";

describe("windowStart", () => {
  it("floors to the start of the hour", () => {
    expect(windowStart(Date.UTC(2026, 0, 1, 10, 37), 3600)).toBe("2026-01-01T10:00:00.000Z");
  });

  it("floors to the start of the day", () => {
    expect(windowStart(Date.UTC(2026, 0, 1, 10, 37), 86400)).toBe("2026-01-01T00:00:00.000Z");
  });
});
