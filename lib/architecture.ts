// Architecture diagrams are described in each project's frontmatter under `architecture`.
// Lanes render left to right (top to bottom on small screens); the rail is a
// band of concerns that apply across every lane.

type Lane = { title: string; nodes: string[]; accent?: boolean };

export type Architecture = {
  label: string;
  lanes: Lane[];
  rail: string[];
  caption: string;
};

// Plain-language reading of the diagram for screen readers.
export function describeArchitecture({ label, lanes, rail }: Architecture) {
  const flow = lanes.map((lane) => `${lane.title}: ${lane.nodes.join(", ")}`).join(" → ");
  const across = rail.length ? ` Across every stage: ${rail.join(", ")}.` : "";
  return `${label}. ${flow}.${across}`;
}
