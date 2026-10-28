import { describe, expect, it } from "vitest";
import { CUT_OFF, parseAnswer, signatureMarker, signedHistory } from "./transcript";

describe("parseAnswer", () => {
  it("separates the signature from the answer", () => {
    expect(parseAnswer(`Joel builds AI systems.${signatureMarker("abc_-1")}`)).toEqual({
      content: "Joel builds AI systems.",
      cutOff: false,
      sig: "abc_-1",
    });
  });

  it("flags a cut-off answer", () => {
    expect(parseAnswer(`Joel built${CUT_OFF}`)).toEqual({ content: "Joel built", cutOff: true, sig: undefined });
  });

  it("hides a marker that is still arriving", () => {
    expect(parseAnswer("Joel builds AI systems.\n[[si").content).toBe("Joel builds AI systems.");
  });
});

describe("signedHistory", () => {
  it("keeps only the three most recent answered questions", () => {
    const pairs = Array.from({ length: 5 }, (_, i) => [
      { role: "user" as const, content: `q${i}` },
      { role: "assistant" as const, content: `a${i}`, sig: `s${i}` },
    ]).flat();
    expect(signedHistory(pairs).map((turn) => turn.content)).toEqual(["q2", "a2", "q3", "a3", "q4", "a4"]);
  });

  it("keeps only questions with a signed answer", () => {
    const history = signedHistory([
      { role: "user", content: "q1" },
      { role: "assistant", content: "a1", sig: "s1" },
      { role: "user", content: "q2" },
      { role: "assistant", content: "partial", cutOff: true },
      { role: "user", content: "q3" },
      { role: "user", content: "q4" },
      { role: "assistant", content: "a4", sig: "s4" },
    ]);
    expect(history).toEqual([
      { role: "user", content: "q1" },
      { role: "assistant", content: "a1", sig: "s1" },
      { role: "user", content: "q4" },
      { role: "assistant", content: "a4", sig: "s4" },
    ]);
  });
});
