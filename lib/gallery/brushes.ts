// Pure helpers for the drawing brushes. Kept free of the DOM so the maths is testable.

export type Point = [number, number];

const round = (value: number) => Math.round(value * 1000) / 1000;

// Places brush dabs every `spacing` pixels along a stroke as its points arrive.
// Live drawing and undo's replay feed it the same points, so both paint the same dabs.
export function createStamper(spacing: number) {
  let previous: Point | null = null;
  let travelled = 0; // distance since the last dab
  return {
    push(point: Point): Point[] {
      if (!previous) {
        previous = point;
        return [point];
      }
      const [x0, y0] = previous;
      const dx = point[0] - x0;
      const dy = point[1] - y0;
      const length = Math.hypot(dx, dy);
      if (length === 0) return [];
      const dabs: Point[] = [];
      let at = spacing - travelled;
      for (; at <= length + 1e-9; at += spacing) dabs.push([round(x0 + (dx * at) / length), round(y0 + (dy * at) / length)]);
      travelled = length - (at - spacing);
      previous = point;
      return dabs;
    },
  };
}

export function withAlpha(hex: string, alpha: number) {
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}
