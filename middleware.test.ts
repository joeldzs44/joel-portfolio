import { afterEach, describe, expect, it, vi } from "vitest";
import { middleware } from "./middleware";

afterEach(() => vi.unstubAllEnvs());

const csp = () => middleware().headers.get("Content-Security-Policy") ?? "";

describe("content security policy", () => {
  it("doesn't allow eval in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(csp()).not.toContain("unsafe-eval");
  });

  it("allows eval in development, which hot reload needs", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(csp()).toContain("unsafe-eval");
  });
});
