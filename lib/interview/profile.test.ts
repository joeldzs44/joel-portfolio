import { describe, expect, it } from "vitest";
import { buildProfile } from "./profile";

describe("buildProfile", () => {
  it("includes projects, availability and experience from content/", async () => {
    const { prompt } = await buildProfile();
    expect(prompt).toContain("Agentic Voice Assistant");
    expect(prompt).toContain("Contract AI");
    expect(prompt).toContain("Open to opportunities");
    expect(prompt).toContain("GEP");
  });

  it("contains no MDX component tags", async () => {
    const { prompt } = await buildProfile();
    expect(prompt).not.toMatch(/<\/?[A-Z][A-Za-z]*/);
  });

  it("is stable between calls", async () => {
    expect((await buildProfile()).hash).toBe((await buildProfile()).hash);
  });
});
