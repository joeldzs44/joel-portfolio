import { Fragment } from "react";
import { clsx } from "clsx";
import { describeArchitecture, groupLanes, type Architecture } from "@/lib/architecture";
import { ArchitectureIcon } from "@/components/architecture-icon";
import { RevealOnView } from "@/components/reveal-on-view";

type Props = {
  architecture: Architecture;
  // Plays a single lime pulse through the lanes the first time the diagram is seen.
  animate?: boolean;
  className?: string;
};

type Lane = Architecture["lanes"][number];

// A connector between lanes: points down when stacked, right from lg up.
function Arrow() {
  return (
    <span className="flex shrink-0 items-center justify-center text-dim">
      <svg viewBox="0 0 12 28" className="h-7 w-3 lg:hidden" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 1v25M2 22l4 4 4-4" />
      </svg>
      <svg viewBox="0 0 28 12" className="hidden h-3 w-7 lg:block" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 6h25M22 2l4 4-4 4" />
      </svg>
    </span>
  );
}

// One group of services: a dashed box with its title in the top-left corner, like a cloud diagram's group.
function LaneGroup({ lane, index }: { lane: Lane; index: number }) {
  return (
    <div
      className={clsx("lane flex min-w-0 flex-col gap-4 border border-dashed p-3 lg:flex-1", lane.accent ? "border-lime/70 bg-moss/60" : "border-line")}
      style={{ "--lane": index } as React.CSSProperties}
    >
      <span className={clsx("font-mono text-[11px] leading-snug", lane.accent ? "text-lime" : "text-dim")}>{lane.title}</span>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-x-2 gap-y-4 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:gap-5">
        {lane.nodes.map((node) => (
          <li key={node.label} className="arch-node flex flex-col items-center gap-2 text-center">
            <span
              className={clsx(
                "arch-tile grid size-11 place-items-center rounded-md border",
                lane.accent ? "border-lime bg-lime text-lime-ink" : "border-line bg-raised text-ink",
              )}
            >
              <ArchitectureIcon name={node.icon} className="size-6" />
            </span>
            <span className="max-w-[16ch] text-[12px] leading-snug text-ink">{node.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Lanes({ lanes, offset, leadingArrow }: { lanes: Lane[]; offset: number; leadingArrow: boolean }) {
  return lanes.map((lane, i) => (
    <Fragment key={lane.title}>
      {(i > 0 || leadingArrow) && <Arrow />}
      <LaneGroup lane={lane} index={offset + i} />
    </Fragment>
  ));
}

export function ArchitectureDiagram({ architecture, animate, className }: Props) {
  const { before, inside, after } = groupLanes(architecture);
  const figure = (
    <figure role="img" aria-label={describeArchitecture(architecture)} className={clsx("flex flex-col gap-7 border border-line bg-surface p-5 md:p-8", className)}>
      <figcaption className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:justify-between md:gap-8">
        <span className="meta text-lime">{architecture.label}</span>
        <span className="text-sm text-muted">{architecture.caption}</span>
      </figcaption>

      <div aria-hidden className="flex flex-col items-stretch lg:flex-row">
        <Lanes lanes={before} offset={0} leadingArrow={false} />
        {inside.length > 0 && (
          <>
            {before.length > 0 && <Arrow />}
            {/* The boundary (e.g. "AWS Cloud"): a solid box with a tagged corner, enclosing its lanes. */}
            <div className="flex min-w-0 flex-col border border-ink/40 lg:flex-[var(--span)]" style={{ "--span": inside.length } as React.CSSProperties}>
              <span className="flex w-fit items-center gap-2 bg-ink/10 py-1 pl-1.5 pr-3 font-mono text-[11px] text-ink">
                <span className="grid size-6 place-items-center bg-ink text-page">
                  <ArchitectureIcon name="cloud" className="size-4" />
                </span>
                {architecture.boundary?.title}
              </span>
              <div className="flex flex-1 flex-col p-3 lg:flex-row">
                <Lanes lanes={inside} offset={before.length} leadingArrow={false} />
              </div>
            </div>
          </>
        )}
        <Lanes lanes={after} offset={before.length + inside.length} leadingArrow={before.length + inside.length > 0} />
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
