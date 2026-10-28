import { describe, expect, it } from "vitest";
import { describeArchitecture, type Architecture } from "./architecture";

const contractAi: Architecture = {
  label: "Contract AI / system overview",
  lanes: [
    { title: "Intake", nodes: ["Contract documents", "Bulk uploads"] },
    { title: "Queue", nodes: ["Kafka"] },
    {
      title: "Services (FastAPI on AKS · horizontal scaling)",
      nodes: ["Clause identification (classical ML)", "Entity extraction (NER)", "AI assistant chat"],
      accent: true,
    },
    { title: "Product", nodes: ["GEP Quantum"] },
  ],
  rail: ["RBAC", "PII masking", "Prompt-injection defence", "New Relic + Langfuse"],
  caption: "Independent services scale per task; bulk jobs queue through Kafka.",
};

describe("describeArchitecture", () => {
  it("reads the lanes in order, then the cross-cutting rail", () => {
    expect(describeArchitecture(contractAi)).toBe(
      "Contract AI / system overview. Intake: Contract documents, Bulk uploads → Queue: Kafka → Services (FastAPI on AKS · horizontal scaling): Clause identification (classical ML), Entity extraction (NER), AI assistant chat → Product: GEP Quantum. Across every stage: RBAC, PII masking, Prompt-injection defence, New Relic + Langfuse.",
    );
  });
});
