"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { clsx } from "clsx";

export type ArchiveEntry = {
  slug: string;
  title: string;
  description: string;
  category: string;
  number: string;
  date: string;
  dateLabel: string;
  tags: string[];
  readingMinutes: number;
  draft: boolean;
};

const PAGE_SIZE = 6;

export function WritingArchive({ entries }: { entries: ArchiveEntry[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [newestFirst, setNewestFirst] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((entry) => counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1));
    return [...counts.entries()];
  }, [entries]);

  const filtered = entries
    .filter((entry) => !category || entry.category === category)
    .sort((a, b) => (newestFirst ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
  const shown = filtered.slice(0, visible);

  const filterButton = (label: string, count: number, value: string | null) => (
    <button
      key={label}
      type="button"
      aria-pressed={category === value}
      onClick={() => {
        setCategory(value);
        setVisible(PAGE_SIZE);
      }}
      className={clsx(
        "font-mono text-xs transition-colors",
        category === value ? "text-lime" : "text-muted hover:text-ink",
      )}
    >
      {label}
      <span className="pl-2.5">{String(count).padStart(2, "0")}</span>
    </button>
  );

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-8">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-x-8 gap-y-3">
          {filterButton("All writing", entries.length, null)}
          {categories.map(([name, count]) => filterButton(name, count, name))}
        </div>
        <button
          type="button"
          onClick={() => setNewestFirst((value) => !value)}
          className="meta transition-colors hover:text-ink"
        >
          {newestFirst ? "Newest first ↓" : "Oldest first ↑"}
        </button>
      </div>

      <ol aria-live="polite">
        {shown.map((entry) => (
          <li key={entry.slug} className="border-b border-line">
            <Link
              href={`/writing/${entry.slug}`}
              className="group grid gap-4 py-8 md:grid-cols-[180px_1fr_auto] md:gap-12"
            >
              <span className="flex flex-col gap-2">
                <span className="meta text-lime">
                  {entry.category} / {entry.number}
                </span>
                <span className="meta">{entry.dateLabel}</span>
              </span>
              <span className="flex flex-col gap-3">
                <span className="font-display text-[clamp(1.375rem,1.1rem+0.9vw,1.625rem)] font-medium leading-[1.2] text-ink transition-colors group-hover:text-lime">
                  {entry.title}
                  {entry.draft && <span className="meta pl-3 align-middle text-dim">Draft</span>}
                </span>
                <span className="max-w-[72ch] text-[15px] leading-[1.7] text-muted">{entry.description}</span>
                <span className="meta">
                  {[...entry.tags.slice(0, 1), `${entry.readingMinutes} min`].join(" / ")}
                </span>
              </span>
              <span
                aria-hidden
                className="hidden text-xl text-lime transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 md:block"
              >
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-8">
        <p className="meta">
          Showing {shown.length} of {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </p>
        {visible < filtered.length && (
          <button
            type="button"
            onClick={() => setVisible((value) => value + PAGE_SIZE)}
            className="inline-flex h-[52px] items-center gap-7 border border-line px-[22px] text-sm font-medium text-ink transition-colors hover:border-lime"
          >
            Earlier notes <span className="text-lime">↓</span>
          </button>
        )}
      </div>
    </div>
  );
}
