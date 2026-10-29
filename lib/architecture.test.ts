import { describe, expect, it } from "vitest";
import { describeArchitecture, groupLanes, type Architecture } from "./architecture";

const voice: Architecture = {
  label: "Agentic Voice / system overview",
  lanes: [
    { title: "Channels", nodes: [{ label: "Web chat", icon: "chat" }, { label: "SMS", icon: "sms" }] },
    { title: "Gateway", nodes: [{ label: "FastAPI on ECS Fargate", icon: "container" }] },
    { title: "Orchestration", nodes: [{ label: "Intent classifier", icon: "classifier" }], accent: true },
    { title: "Systems", nodes: [{ label: "ProjectsForce APIs", icon: "api" }] },
  ],
  boundary: { title: "AWS Cloud", from: 1, to: 2 },
  rail: ["Guardrails", "Observability"],
  caption: "Every request is classified once.",
};

describe("describeArchitecture", () => {
  it("reads the lanes in order, the boundary, then the cross-cutting rail", () => {
    expect(describeArchitecture(voice)).toBe(
      "Agentic Voice / system overview. Channels: Web chat, SMS → Gateway: FastAPI on ECS Fargate → Orchestration: Intent classifier → Systems: ProjectsForce APIs. Gateway and Orchestration run in AWS Cloud. Across every stage: Guardrails, Observability.",
    );
  });

  it("leaves out the boundary and rail sentences when there are none", () => {
    expect(describeArchitecture({ ...voice, boundary: undefined, rail: [] })).toBe(
      "Agentic Voice / system overview. Channels: Web chat, SMS → Gateway: FastAPI on ECS Fargate → Orchestration: Intent classifier → Systems: ProjectsForce APIs.",
    );
  });
});

describe("groupLanes", () => {
  it("splits the lanes around the boundary", () => {
    const { before, inside, after } = groupLanes(voice);
    expect(before.map((lane) => lane.title)).toEqual(["Channels"]);
    expect(inside.map((lane) => lane.title)).toEqual(["Gateway", "Orchestration"]);
    expect(after.map((lane) => lane.title)).toEqual(["Systems"]);
  });

  it("puts every lane before when there is no boundary", () => {
    const { before, inside, after } = groupLanes({ ...voice, boundary: undefined });
    expect([before.length, inside.length, after.length]).toEqual([4, 0, 0]);
  });
});
