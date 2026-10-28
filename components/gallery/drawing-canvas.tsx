"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { clsx } from "clsx";

const CANVAS = { width: 480, height: 360, background: "#101210" } as const;

const SWATCHES = [
  { name: "Ink", value: "#f0f2e9" },
  { name: "Lime", value: "#c5f46b" },
  { name: "Sage", value: "#a7afa3" },
  { name: "Blue", value: "#7fb2ff" },
  { name: "Coral", value: "#ff8a65" },
];
const SIZES = [2, 6, 14];

type Stroke = { color: string; size: number; points: [number, number][] };

export type DrawingCanvasHandle = { toDataURL(): string; undo(): void; clear(): void };

export function DrawingCanvas({ ref, onChange }: { ref: React.Ref<DrawingCanvasHandle>; onChange: (empty: boolean) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const [color, setColor] = useState(SWATCHES[1].value);
  const [size, setSize] = useState(SIZES[1]);
  const [eraser, setEraser] = useState(false);

  function context() {
    return canvas.current?.getContext("2d") ?? null;
  }

  function paint(stroke: Stroke) {
    const ctx = context();
    if (!ctx || !stroke.points.length) return;
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const [first, ...rest] = stroke.points;
    if (!rest.length) {
      ctx.beginPath();
      ctx.arc(first[0], first[1], stroke.size / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(...first);
    rest.forEach((point) => ctx.lineTo(...point));
    ctx.stroke();
  }

  function redraw() {
    const ctx = context();
    if (!ctx) return;
    ctx.fillStyle = CANVAS.background;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
    strokes.current.forEach(paint);
  }

  useEffect(redraw, []);

  function commit() {
    onChange(strokes.current.length === 0);
  }

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

  function point(event: React.PointerEvent<HTMLCanvasElement>): [number, number] {
    const rect = event.currentTarget.getBoundingClientRect();
    return [
      Math.round(((event.clientX - rect.left) / rect.width) * CANVAS.width),
      Math.round(((event.clientY - rect.top) / rect.height) * CANVAS.height),
    ];
  }

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvas}
        width={CANVAS.width}
        height={CANVAS.height}
        aria-label="Drawing canvas"
        className="aspect-[4/3] w-full cursor-crosshair touch-none border border-line"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          current.current = { color: eraser ? CANVAS.background : color, size: eraser ? size * 2 : size, points: [point(event)] };
          paint(current.current);
        }}
        onPointerMove={(event) => {
          if (!current.current) return;
          current.current.points.push(point(event));
          paint({ ...current.current, points: current.current.points.slice(-2) });
        }}
        onPointerUp={() => {
          if (!current.current) return;
          strokes.current = [...strokes.current, current.current];
          current.current = null;
          commit();
        }}
        onPointerCancel={() => {
          current.current = null;
          redraw();
        }}
      />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div role="radiogroup" aria-label="Colour" className="flex gap-2">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch.value}
              type="button"
              role="radio"
              aria-checked={!eraser && color === swatch.value}
              aria-label={swatch.name}
              onClick={() => {
                setColor(swatch.value);
                setEraser(false);
              }}
              className={clsx("size-7 border-2", !eraser && color === swatch.value ? "border-ink" : "border-transparent")}
              style={{ background: swatch.value }}
            />
          ))}
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
              <span className="rounded-full bg-ink" style={{ width: Math.max(3, value), height: Math.max(3, value) }} />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={eraser}
          onClick={() => setEraser((value) => !value)}
          className={clsx("h-8 border px-3 text-sm", eraser ? "border-lime text-lime" : "border-line text-ink")}
        >
          Eraser
        </button>
      </div>
    </div>
  );
}
