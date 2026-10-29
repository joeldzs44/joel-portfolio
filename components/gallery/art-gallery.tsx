"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { clsx } from "clsx";
import type { ArtCommit } from "@/lib/gallery/store";
import { TAGS, type Tag } from "@/lib/gallery/constants";
import { ActionArrow, actionClasses } from "@/components/ui";

// Loaded when someone starts a drawing, not with the home page.
const DrawingDialog = dynamic(() => import("@/components/gallery/drawing-dialog").then((m) => m.DrawingDialog), { ssr: false });

export function ArtGallery({ art, empty }: { art: ArtCommit[]; empty: string }) {
  const [filter, setFilter] = useState<Tag | "all">("all");
  const [drawing, setDrawing] = useState(false);
  const shown = filter === "all" ? art : art.filter((item) => item.tag === filter);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-2">
          {(["all", ...TAGS] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={clsx(
                "border px-3 py-1.5 font-mono text-[13px] transition-colors",
                filter === value ? "border-lime text-lime" : "border-line text-muted hover:text-ink",
              )}
            >
              {value === "all" ? "All" : value}
            </button>
          ))}
        </div>
        <button type="button" aria-haspopup="dialog" onClick={() => setDrawing(true)} className={actionClasses("primary", "w-full sm:w-auto")}>
          <span>New art commit</span>
          <ActionArrow arrow="+" />
        </button>
      </div>

      {shown.length ? (
        <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
          {shown.map((item) => (
            <li key={item.id} className="flex flex-col border border-line bg-raised">
              <img src={item.imageUrl} alt={`Drawing tagged ${item.tag}${item.name ? ` by ${item.name}` : ""}`} width={480} height={360} loading="lazy" className="aspect-[4/3] w-full" />
              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-ink">{item.name || "Anonymous"}</span>
                  <span className="shrink-0 border border-line px-2 py-0.5 font-mono text-[11px] text-lime">{item.tag}</span>
                </div>
                {item.message && <p className="break-words text-sm leading-relaxed text-muted">{item.message}</p>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border border-dashed border-line p-8 text-center text-muted">{filter === "all" ? empty : `No “${filter}” drawings yet.`}</p>
      )}

      {drawing && <DrawingDialog onClose={() => setDrawing(false)} />}
    </div>
  );
}
