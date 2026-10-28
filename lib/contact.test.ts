import { describe, expect, it } from "vitest";
import { validateContact } from "./contact";

const valid = { name: "  Ada Lovelace ", email: " ada@example.com ", message: "Hello there, let's talk." };

describe("validateContact", () => {
  it("accepts valid input and trims it", () => {
    expect(validateContact(valid)).toEqual({
      ok: true,
      value: { name: "Ada Lovelace", email: "ada@example.com", message: "Hello there, let's talk." },
    });
  });

  it("requires a name", () => {
    const result = validateContact({ ...valid, name: "  " });
    expect(result.ok === false && result.errors.name).toBeTruthy();
  });

  it("rejects a malformed email", () => {
    const result = validateContact({ ...valid, email: "not-an-email" });
    expect(result.ok === false && result.errors.email).toBeTruthy();
  });

  it("rejects a message over 2,000 characters", () => {
    const result = validateContact({ ...valid, message: "a".repeat(2001) });
    expect(result.ok === false && result.errors.message).toBeTruthy();
  });

  it("strips control characters", () => {
    const result = validateContact({ ...valid, name: "Ada\u0000\u0007 L", message: "Hi\u001b there\nfriend" });
    expect(result.ok && result.value).toMatchObject({ name: "Ada L", message: "Hi there\nfriend" });
  });

  it("rejects a non-object body", () => {
    expect(validateContact(null).ok).toBe(false);
  });
});
