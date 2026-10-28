import { Fragment } from "react";
import { clsx } from "clsx";
import { describeArchitecture, type Architecture } from "@/lib/architecture";
import { RevealOnView } from "@/components/reveal-on-view";

type Props = {
  architecture: Architecture;
  size?: "compact" | "full";
  // Plays a single lime pulse through the lanes the first time the diagram is seen.
  animate?: boolean;
  className?: string;
};

export function ArchitectureDiagram({ architecture, size = "full", animate, className }: Props) {
  const compact = size === "compact";
  const figure = (
    <figure
      role="img"
      aria-label={describeArchitecture(architecture)}
      className={clsx("flex flex-col border border-line bg-surface", compact ? "gap-5 p-5 md:p-6" : "gap-7 p-5 md:p-8", className)}
    >
      <figcaption className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:justify-between md:gap-8">
        <span className="meta text-lime">{architecture.label}</span>
        <span className="text-sm text-muted">{architecture.caption}</span>
      </figcaption>

      <div aria-hidden className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-0">
        {architecture.lanes.map((lane, index) => (
          <Fragment key={lane.title}>
            {index > 0 && (
              <span className="self-center text-lg leading-none text-dim lg:px-2">
                <span className="lg:hidden">↓</span>
                <span className="hidden lg:inline">→</span>
              </span>
            )}
            <div
              className={clsx(
                "lane flex min-w-0 flex-col gap-2.5 border p-3 lg:flex-1",
                lane.accent ? "border-lime/60 bg-moss" : "border-line bg-raised",
              )}
              style={{ "--lane": index } as React.CSSProperties}
            >
              <span className={clsx("font-mono text-[11px] leading-snug", lane.accent ? "text-lime" : "text-dim")}>{lane.title}</span>
              <ul className="flex flex-wrap gap-1.5 lg:flex-col">
                {lane.nodes.map((node) => (
                  <li
                    key={node}
                    className={clsx(
                      "border px-2.5 py-1.5 leading-snug",
                      compact ? "text-[12px]" : "text-[13px]",
                      lane.accent ? "border-lime/40 text-ink" : "border-line text-ink",
                    )}
                  >
                    {node}
                  </li>
                ))}
              </ul>
            </div>
          </Fragment>
        ))}
      </div>

      {architecture.rail.length > 0 && (
        <div aria-hidden className="flex flex-col gap-2.5 border-t border-dashed border-line pt-4 md:flex-row md:items-center md:gap-4">
          <span className="shrink-0 font-mono text-[11px] text-dim">Across every stage</span>
          <ul className="flex flex-wrap gap-1.5">
            {architecture.rail.map((item) => (
              <li key={item} className="border border-line px-2.5 py-1 font-mono text-[11px] text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );

  return animate ? <RevealOnView className="architecture-live">{figure}</RevealOnView> : figure;
}
