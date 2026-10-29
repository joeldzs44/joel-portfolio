// Architecture diagrams are described in each project's frontmatter under `architecture`.
// They follow cloud architecture diagram conventions: each lane is a labelled group of
// services drawn as icons, lanes connect left to right (top to bottom on small screens),
// an optional boundary (e.g. "AWS Cloud") encloses lanes `from`..`to` (0-based, inclusive),
// and the rail lists concerns that apply across every lane.

export const ICONS = [
  "agent",
  "api",
  "browser",
  "chat",
  "classifier",
  "cloud",
  "container",
  "database",
  "document",
  "documents",
  "email",
  "function",
  "model",
  "phone",
  "phone-out",
  "product",
  "queue",
  "shield",
  "sms",
  "storage",
] as const;

export type IconName = (typeof ICONS)[number];

type Node = { label: string; icon: IconName };
type Lane = { title: string; nodes: Node[]; accent?: boolean };

export type Architecture = {
  label: string;
  lanes: Lane[];
  boundary?: { title: string; from: number; to: number };
  rail: string[];
  caption: string;
};

export function groupLanes({ lanes, boundary }: Architecture) {
  if (!boundary) return { before: lanes, inside: [] as Lane[], after: [] as Lane[] };
  return {
    before: lanes.slice(0, boundary.from),
    inside: lanes.slice(boundary.from, boundary.to + 1),
    after: lanes.slice(boundary.to + 1),
  };
}

// Plain-language reading of the diagram for screen readers.
export function describeArchitecture(architecture: Architecture) {
  const { label, lanes, boundary, rail } = architecture;
  const flow = lanes.map((lane) => `${lane.title}: ${lane.nodes.map((node) => node.label).join(", ")}`).join(" → ");
  const inside = groupLanes(architecture).inside.map((lane) => lane.title);
  const within = boundary && inside.length ? ` ${inside.join(" and ")} run in ${boundary.title}.` : "";
  const across = rail.length ? ` Across every stage: ${rail.join(", ")}.` : "";
  return `${label}. ${flow}.${within}${across}`;
}
