import { describe, expect, it } from "vitest";
import { cleanLine, cleanText } from "./text";

describe("cleanText", () => {
  it("turns a lone carriage return into a line break", () => {
    expect(cleanText("a\rb")).toBe("a\nb");
  });
});

describe("cleanLine", () => {
  it("collapses line breaks and runs of whitespace into single spaces", () => {
    expect(cleanLine(" Ana\n  Smith\t ")).toBe("Ana Smith");
  });
});
