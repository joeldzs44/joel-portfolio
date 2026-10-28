import { describe, expect, it } from "vitest";
import { activeNavLabel } from "./nav";

describe("activeNavLabel", () => {
  it("marks Home at the top of the home page", () => {
    expect(activeNavLabel("/", null)).toBe("Home");
  });

  it("follows the section in view on the home page", () => {
    expect(activeNavLabel("/", "work")).toBe("Work");
    expect(activeNavLabel("/", "skills")).toBe("Skills");
    expect(activeNavLabel("/", "experience")).toBe("Experience");
    expect(activeNavLabel("/", "certifications")).toBe("Experience");
    expect(activeNavLabel("/", "contact")).toBe("Contact");
  });

  it("marks nothing for a section without a nav item", () => {
    expect(activeNavLabel("/", "art")).toBeNull();
  });

  it("uses the route on other pages", () => {
    expect(activeNavLabel("/projects/contract-ai", "work")).toBe("Work");
    expect(activeNavLabel("/writing", null)).toBe("Writing");
    expect(activeNavLabel("/admin/gallery", null)).toBeNull();
  });
});
