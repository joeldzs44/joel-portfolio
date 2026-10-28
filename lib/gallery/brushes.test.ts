import { describe, expect, it } from "vitest";
import { createStamper, withAlpha, type Point } from "./brushes";

const walk = (spacing: number, points: Point[]) => {
  const stamper = createStamper(spacing);
  return points.flatMap((point) => stamper.push(point));
};

describe("createStamper", () => {
  it("places dabs at even spacing along a line, starting at the first point", () => {
    expect(walk(2, [[0, 0], [10, 0]])).toEqual([[0, 0], [2, 0], [4, 0], [6, 0], [8, 0], [10, 0]]);
  });

  it("keeps the spacing around corners", () => {
    expect(walk(2, [[0, 0], [3, 0], [3, 3]])).toEqual([[0, 0], [2, 0], [3, 1], [3, 3]]);
  });

  it("gives the same dabs whether points arrive one by one or as a finished stroke", () => {
    const stroke: Point[] = [[0, 0], [1, 1], [4, 1], [4, 7], [9, 9]];
    const live = createStamper(1.5);
    const incremental = stroke.flatMap((point) => live.push(point));
    const replayed = walk(1.5, stroke);
    expect(incremental).toEqual(replayed);
  });

  it("ignores repeated points", () => {
    expect(walk(2, [[5, 5], [5, 5], [5, 5]])).toEqual([[5, 5]]);
  });
});

describe("withAlpha", () => {
  it("turns a hex colour into rgba", () => {
    expect(withAlpha("#c5f46b", 0.25)).toBe("rgba(197, 244, 107, 0.25)");
  });
});
