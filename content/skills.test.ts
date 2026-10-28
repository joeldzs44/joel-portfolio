import { describe, expect, it } from "vitest";
import { topSkills } from "./skills";

describe("topSkills", () => {
  it("lists the tools marked top, in order of appearance", () => {
    expect(topSkills()).toEqual(["Python", "FastAPI", "LLM agents", "RAG", "AWS Bedrock", "Azure / AKS", "Kafka"]);
  });
});
