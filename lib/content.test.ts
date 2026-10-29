import { describe, expect, it } from "vitest";
import { getAllProjects } from "./content";
import { ICONS } from "./architecture";

describe("project architecture diagrams", () => {
  it("only use icons the diagram can draw, and boundaries that fit the lanes", async () => {
    for (const { slug, architecture } of await getAllProjects()) {
      for (const lane of architecture.lanes) {
        for (const node of lane.nodes) expect(ICONS, `${slug}: ${node.label}`).toContain(node.icon);
      }
      if (architecture.boundary) {
        const { from, to } = architecture.boundary;
        expect(0 <= from && from <= to && to < architecture.lanes.length, slug).toBe(true);
      }
    }
  });
});
