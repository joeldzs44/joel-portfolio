import { describe, expect, it } from "vitest";
import { orderedTools, toolName, topSkills } from "./skills";

describe("topSkills", () => {
  it("lists the tools marked top, by rank", () => {
    expect(topSkills()).toEqual(["Python", "FastAPI", "LLM agents", "RAG", "AWS Bedrock", "Azure / AKS", "Kafka"]);
  });
});

describe("orderedTools", () => {
  it("puts top tools first by rank and keeps the rest in their written order", () => {
    const tools = ["Docker", { name: "Kafka", top: 7 }, "SQL", { name: "Python", top: 1 }];
    expect(orderedTools(tools).map(toolName)).toEqual(["Python", "Kafka", "Docker", "SQL"]);
  });
});
