import { afterEach, describe, expect, it, vi } from "vitest";
import { securityHeaders } from "./security-headers.mjs";

afterEach(() => vi.unstubAllEnvs());

const csp = () => securityHeaders().find((header) => header.key === "Content-Security-Policy")?.value ?? "";

describe("content security policy", () => {
  it("doesn't allow eval in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(csp()).not.toContain("unsafe-eval");
  });

  it("allows eval in development, which hot reload needs", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(csp()).toContain("unsafe-eval");
  });

  it("allows drawings from the Supabase project", () => {
    vi.stubEnv("SUPABASE_URL", "https://abc.supabase.co/rest/v1/");
    expect(csp()).toContain("img-src 'self' blob: data: https://abc.supabase.co");
  });
});

describe("security headers", () => {
  it("blocks framing and sniffing", () => {
    const keys = securityHeaders().map((header) => header.key);
    expect(keys).toEqual(
      expect.arrayContaining(["X-Frame-Options", "Strict-Transport-Security", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy"]),
    );
  });
});
