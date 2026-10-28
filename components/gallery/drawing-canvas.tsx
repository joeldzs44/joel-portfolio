"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { clsx } from "clsx";
import { createStamper, withAlpha, type Point } from "@/lib/gallery/brushes";

const CANVAS = { width: 480, height: 360, background: "#101210" } as const;

const SWATCHES = [
  { name: "Ink", value: "#f0f2e9" },
  { name: "Grey", value: "#6b7268" },
  { name: "Lime", value: "#c5f46b" },
  { name: "Green", value: "#4fa86b" },
  { name: "Teal", value: "#4fd1c5" },
  { name: "Blue", value: "#7fb2ff" },
  { name: "Indigo", value: "#5b6cff" },
  { name: "Purple", value: "#b48cff" },
  { name: "Pink", value: "#ff8fd0" },
  { name: "Red", value: "#ff5c5c" },
  { name: "Coral", value: "#ff8a65" },
  { name: "Orange", value: "#ffa24c" },
  { name: "Yellow", value: "#ffd54f" },
  { name: "Brown", value: "#a8744f" },
];
const SIZES = [2, 6, 14, 28];

const TOOLS = [
  { id: "pen", label: "Pen", hint: "Solid lines" },
  { id: "marker", label: "Marker", hint: "See-through ink that mixes where strokes overlap" },
  { id: "soft", label: "Soft", hint: "Airbrush that builds up colour" },
  { id: "smudge", label: "Smudge", hint: "Drags and blends the paint underneath" },
  { id: "eraser", label: "Eraser", hint: "Paints the background back" },
] as const;
type Tool = (typeof TOOLS)[number]["id"];

type Stroke = { tool: Tool; color: string; size: number; points: Point[] };

const MARKER_ALPHA = 0.4;
const SOFT_ALPHA = 0.22;
const SMUDGE_STRENGTH = 0.65;
const markerWidth = (size: number) => Math.max(size, 6);
const softRadius = (size: number) => Math.max(size, 4);
const smudgeRadius = (size: number) => Math.max(size, 6);

export type DrawingCanvasHandle = { toDataURL(): string; undo(): void; clear(): void };

function line(ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (points.length === 1) {
    ctx.arc(points[0][0], points[0][1], width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.moveTo(...points[0]);
  points.slice(1).forEach((point) => ctx.lineTo(...point));
  ctx.stroke();
}

function softDab(ctx: CanvasRenderingContext2D, [x, y]: Point, color: string, radius: number) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, withAlpha(color, SOFT_ALPHA));
  gradient.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// Copies a feathered circle of paint from the previous dab onto this one.
function smudgeDab(ctx: CanvasRenderingContext2D, scratch: HTMLCanvasElement, from: Point, to: Point, radius: number) {
  const size = Math.ceil(radius * 2);
  scratch.width = size;
  scratch.height = size;
  const pctx = scratch.getContext("2d")!;
  pctx.drawImage(ctx.canvas, from[0] - radius, from[1] - radius, size, size, 0, 0, size, size);
  const mask = pctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  mask.addColorStop(0, "rgba(0, 0, 0, 1)");
  mask.addColorStop(0.6, "rgba(0, 0, 0, 0.8)");
  mask.addColorStop(1, "rgba(0, 0, 0, 0)");
  pctx.globalCompositeOperation = "destination-in";
  pctx.fillStyle = mask;
  pctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = SMUDGE_STRENGTH;
  ctx.drawImage(scratch, to[0] - radius, to[1] - radius);
  ctx.globalAlpha = 1;
}

// Starts painting a stroke and returns a function that paints each new point.
// Undo replays finished strokes through the same code, so the result matches.
function begin(ctx: CanvasRenderingContext2D, scratch: HTMLCanvasElement, stroke: Stroke): (point: Point) => void {
  const { tool, color, size } = stroke;
  if (tool === "pen" || tool === "eraser") {
    const ink = tool === "eraser" ? CANVAS.background : color;
    const width = tool === "eraser" ? size * 2 : size;
    let last = stroke.points[0];
    line(ctx, [last], ink, width);
    return (point) => {
      line(ctx, [last, point], ink, width);
      last = point;
    };
  }
  if (tool === "marker") {
    // Redrawn whole on each point so the stroke doesn't darken where its own segments overlap.
    const before = ctx.getImageData(0, 0, CANVAS.width, CANVAS.height);
    const points = [stroke.points[0]];
    const draw = () => {
      ctx.putImageData(before, 0, 0);
      ctx.globalAlpha = MARKER_ALPHA;
      line(ctx, points, color, markerWidth(size));
      ctx.globalAlpha = 1;
    };
    draw();
    return (point) => {
      points.push(point);
      draw();
    };
  }
  const radius = tool === "soft" ? softRadius(size) : smudgeRadius(size);
  const stamper = createStamper(Math.max(1, radius * (tool === "soft" ? 0.25 : 0.15)));
  let previous: Point | null = null;
  const dab = (point: Point) => {
    if (tool === "soft") softDab(ctx, point, color, radius);
    else if (previous) smudgeDab(ctx, scratch, previous, point, radius);
    previous = point;
  };
  stamper.push(stroke.points[0]).forEach(dab);
  return (point) => stamper.push(point).forEach(dab);
}

export function DrawingCanvas({ ref, onChange }: { ref: React.Ref<DrawingCanvasHandle>; onChange: (empty: boolean) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scratch = useRef<HTMLCanvasElement | null>(null);
  const strokes = useRef<Stroke[]>([]);
  const live = useRef<{ stroke: Stroke; add: (point: Point) => void } | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(SWATCHES[2].value);
  const [size, setSize] = useState(SIZES[1]);
  const custom = !SWATCHES.some((swatch) => swatch.value === color);
  const colourApplies = tool !== "smudge" && tool !== "eraser";

  // Smudge and marker read pixels back, so ask for a CPU-backed canvas.
  const context = () => canvas.current?.getContext("2d", { willReadFrequently: true }) ?? null;
  const scratchCanvas = () => (scratch.current ??= document.createElement("canvas"));

  function redraw() {
    const ctx = context();
    if (!ctx) return;
    ctx.fillStyle = CANVAS.background;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
    for (const stroke of strokes.current) {
      if (stroke.tool === "marker") {
        // A finished marker stroke is drawn once; it needs no per-point snapshots.
        ctx.globalAlpha = MARKER_ALPHA;
        line(ctx, stroke.points, stroke.color, markerWidth(stroke.size));
        ctx.globalAlpha = 1;
        continue;
      }
      const add = begin(ctx, scratchCanvas(), stroke);
      stroke.points.slice(1).forEach(add);
    }
  }

  useEffect(redraw, []);

  const commit = () => onChange(strokes.current.length === 0);

  useImperativeHandle(ref, () => ({
    toDataURL: () => canvas.current?.toDataURL("image/png") ?? "",
    undo() {
      strokes.current.pop();
      redraw();
      commit();
    },
    clear() {
      strokes.current = [];
      redraw();
      commit();
    },
  }));

  function point(event: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return [
      Math.round(((event.clientX - rect.left) / rect.width) * CANVAS.width),
      Math.round(((event.clientY - rect.top) / rect.height) * CANVAS.height),
    ];
  }

  function pickColor(value: string) {
    setColor(value);
    // Colour doesn't apply to smudge or the eraser; picking one means "paint".
    if (!colourApplies) setTool("pen");
  }

  return (
    <div className="flex flex-col gap-4">
      <canvas
        ref={canvas}
        width={CANVAS.width}
        height={CANVAS.height}
        aria-label="Drawing canvas"
        className="aspect-[4/3] w-full cursor-crosshair touch-none border border-line"
        onPointerDown={(event) => {
          const ctx = context();
          if (!ctx) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          const stroke: Stroke = { tool, color, size, points: [point(event)] };
          live.current = { stroke, add: begin(ctx, scratchCanvas(), stroke) };
        }}
        onPointerMove={(event) => {
          if (!live.current) return;
          const next = point(event);
          const last = live.current.stroke.points.at(-1)!;
          if (next[0] === last[0] && next[1] === last[1]) return;
          live.current.stroke.points.push(next);
          live.current.add(next);
        }}
        onPointerUp={() => {
          if (!live.current) return;
          strokes.current = [...strokes.current, live.current.stroke];
          live.current = null;
          commit();
        }}
        onPointerCancel={() => {
          live.current = null;
          redraw();
        }}
      />

      <div role="radiogroup" aria-label="Brush" className="flex flex-wrap gap-1">
        {TOOLS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={tool === option.id}
            title={option.hint}
            onClick={() => setTool(option.id)}
            className={clsx(
              "h-8 border px-3 text-sm transition-colors",
              tool === option.id ? "border-lime bg-lime text-lime-ink" : "border-line text-ink hover:border-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div role="radiogroup" aria-label="Colour" className={clsx("flex flex-wrap gap-1.5 transition-opacity", !colourApplies && "opacity-50")}>
          {SWATCHES.map((swatch) => (
            <button
              key={swatch.value}
              type="button"
              role="radio"
              aria-checked={color === swatch.value}
              aria-label={swatch.name}
              onClick={() => pickColor(swatch.value)}
              className={clsx("size-7 border-2", color === swatch.value ? "border-ink" : "border-transparent")}
              style={{ background: swatch.value }}
            />
          ))}
          <label
            title="Pick any colour"
            className={clsx(
              "relative size-7 cursor-pointer border-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lime",
              custom ? "border-ink" : "border-transparent",
            )}
            style={{ background: custom ? color : "conic-gradient(#ff5c5c, #ffd54f, #c5f46b, #4fd1c5, #7fb2ff, #b48cff, #ff8fd0, #ff5c5c)" }}
          >
            <span className="sr-only">Custom colour</span>
            <input type="color" value={color} onChange={(event) => pickColor(event.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" />
          </label>
        </div>

        <div role="radiogroup" aria-label="Brush size" className="flex gap-1">
          {SIZES.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={size === value}
              aria-label={`${value}px brush`}
              onClick={() => setSize(value)}
              className={clsx("grid size-8 place-items-center border", size === value ? "border-lime" : "border-line")}
            >
              <span className="rounded-full bg-ink" style={{ width: Math.min(20, Math.max(3, value * 0.7)), height: Math.min(20, Math.max(3, value * 0.7)) }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
