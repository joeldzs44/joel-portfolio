import { describe, expect, it, vi } from "vitest";

const content = vi.hoisted(() => ({ fail: true }));
vi.mock("@/lib/content", async (actual) => {
  const real = await actual<typeof import("@/lib/content")>();
  return {
    ...real,
    getAllProjects: () => (content.fail ? Promise.reject(new Error("disk")) : real.getAllProjects()),
  };
});

import { buildProfile } from "./profile";

describe("buildProfile after a failure", () => {
  it("tries again instead of keeping the failure", async () => {
    await expect(buildProfile()).rejects.toThrow("disk");
    content.fail = false;
    await expect(buildProfile()).resolves.toMatchObject({ hash: expect.any(String) });
  });
});
