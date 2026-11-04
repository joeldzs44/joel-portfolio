// Newest first. `end: null` means "Present". Dates are "YYYY-MM".

export type Role = {
  title: string;
  company: string;
  location: string;
  start: string;
  end: string | null;
  summary: string;
  highlights: string[];
};

export const experience: Role[] = [
  {
    title: "Senior Data Scientist",
    company: "ProjectsForce",
    location: "Mumbai",
    start: "2026-06",
    end: null,
    summary:
      "Building an agentic voice and chat scheduling assistant for U.S. big-box retail clients, live with a beta client and handling 100+ calls a day.",
    highlights: [
      "Redesigned the legacy voice automation platform handling 100+ calls a day for appointment scheduling, customer support and lead onboarding, moving from VAPI-hosted LLMs to custom in-code agents (AWS Agent Squad) with guardrails and prompt engineering — raising call resolution from ~60% to 90% for large U.S. big-box retail clients.",
      "Optimized the voice pipeline with response caching, real-time tenant and caller context and leaner LLM usage across the board, cutting LLM costs by ~50% without affecting call quality.",
      "Built an automated testing framework for voice agents: a simulated caller agent runs test cases against the live agent and an LLM-as-judge scores each transcript against test-specific rubrics, enabling repeatable regression testing of agent changes.",
    ],
  },
  {
    title: "Senior Data Scientist",
    company: "GEP",
    location: "Mumbai",
    start: "2021-06",
    end: "2026-05",
    summary:
      "Built contract intelligence for enterprise procurement: RAG-based Q&A across large document corpora, LLM-powered entity extraction and NER pipelines running in production for 20+ enterprise clients.",
    highlights: [
      "Architected GEP’s end-to-end Contracts AI solution, spanning document digitization, NER-based extraction and RAG-powered contract Q&A, with a focus on system reliability, SLA compliance and client adoption.",
      "Built and deployed RAG-based LLM applications with LangChain, Qdrant and embeddings, enabling enterprise-scale contract Q&A across large document corpora.",
      "Developed LLM-powered NER systems and synthetic datasets with LLaMA 3, improving model robustness across diverse document formats.",
      "Implemented NER pipelines with spaCy and transformer models for the Contracts AI digitization solution, used by 20+ enterprise clients in production.",
      "Built multi-agent GenAI workflows for autonomous task execution, integrating LLMs with APIs, document systems and business logic.",
      "Developed and deployed production-grade AI services with Python, FastAPI and Docker, with scalability, monitoring and CI/CD integration.",
      "Engineered prompt optimization and retrieval strategies to improve response accuracy, latency and contextual relevance in LLM applications.",
      "Led MLOps for generative AI models, with RBAC, PII masking and prompt-injection defences, and New Relic and Langfuse monitoring in production.",
    ],
  },
];

export const education = {
  degree: "Bachelor of Engineering in Computer Science",
  school: "Xavier Institute of Engineering, Mumbai University",
  year: "2021",
};
