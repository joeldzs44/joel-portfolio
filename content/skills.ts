// Each discipline renders as one card in the Toolkit section; add or remove freely.
// Give a tool a `top` rank to feature it in the hero (1 shows first) and highlight it here.

export type Tool = string | { name: string; top: number };

export type Discipline = {
  title: string;
  tagline: string;
  tools: Tool[];
};

export const skills: Discipline[] = [
  {
    title: "LLM applications & agents",
    tagline: "From raw documents and phone calls to grounded, useful answers.",
    tools: [
      { name: "LLM agents", top: 3 },
      { name: "RAG", top: 4 },
      "Multi-agent orchestration",
      "AgentSquad",
      "LangGraph",
      "LangChain",
      "LlamaIndex",
      "Prompt engineering",
      "Embeddings",
      "Qdrant",
      "pgvector",
      { name: "AWS Bedrock", top: 5 },
      "Vapi voice AI",
    ],
  },
  {
    title: "Models & NLP",
    tagline: "Trained and tuned for the documents that matter.",
    tools: [
      "Fine-tuning LLMs",
      "Classical ML",
      "Hugging Face",
      "PyTorch",
      "NER (spaCy)",
      "OCR",
      "Summarization",
      "Question answering",
    ],
  },
  {
    title: "Systems & delivery",
    tagline: "Services that scale out, queue up and stay up.",
    tools: [
      { name: "Python", top: 1 },
      { name: "FastAPI", top: 2 },
      "Asyncio",
      "Microservices",
      { name: "Kafka", top: 7 },
      "Docker",
      { name: "Azure / AKS", top: 6 },
      "AWS ECS Fargate",
      "Azure Functions",
      "SQL",
      "MongoDB",
      "CI/CD",
    ],
  },
  {
    title: "Reliability & safety",
    tagline: "Guardrails and visibility that let teams trust what ships.",
    tools: ["Guardrails", "Prompt-injection defence", "PII masking", "RBAC", "Langfuse", "New Relic", "SonarCloud", "GHAS"],
  },
  {
    title: "Web & product",
    tagline: "The full stack behind this site, from the UI to the edge.",
    tools: [
      "TypeScript",
      "Next.js",
      "React",
      "Tailwind CSS",
      "Supabase (Postgres)",
      "Vercel",
      "OpenRouter",
      "Cloudflare Turnstile",
      "Resend",
      "Vitest",
    ],
  },
];

export const toolName = (tool: Tool) => (typeof tool === "string" ? tool : tool.name);
export const isTop = (tool: Tool) => typeof tool !== "string";

// Top tools first, by rank, then the rest in the order they're written.
export function orderedTools(tools: Tool[]) {
  const top = tools.filter((tool): tool is Exclude<Tool, string> => typeof tool !== "string").sort((a, b) => a.top - b.top);
  return [...top, ...tools.filter((tool) => typeof tool === "string")];
}

export function topSkills() {
  return skills
    .flatMap((discipline) => discipline.tools)
    .filter((tool): tool is Exclude<Tool, string> => typeof tool !== "string")
    .sort((a, b) => a.top - b.top)
    .map((tool) => tool.name);
}
