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
      "Building agentic voice and chat platforms for U.S. big-box retail clients: a voice automation system handling 100+ calls a day, and PF360 AI Assistant, a multi-channel customer-experience platform on Amazon Bedrock.",
    highlights: [
      "Built an agentic AI voice automation platform for appointment scheduling and rescheduling, customer support and lead onboarding with Python, VAPI, Twilio and LangGraph, handling 100+ inbound and outbound calls per day.",
      "Architected a LangGraph multi-step agentic workflow with tenant-level prompts, giving voice agents real-time tenant- and caller-specific context for personalized task execution.",
      "Integrated the voice platform with ProjectsForce’s CRM so retail clients could automate customer interactions and operational workflows through AI-powered calling.",
      "Architected PF360 AI Assistant: a classifier-driven orchestrator routing chat and real-time voice queries to pluggable AI modules, grounded by hybrid-search RAG on Amazon Bedrock and Aurora pgvector, scaling to thousands of concurrent users on queue-backed ECS Fargate workers.",
    ],
  },
  {
    title: "Senior Data Scientist",
    company: "GEP",
    location: "Mumbai",
    start: "2021-06",
    end: "2026-05",
    summary:
      "Built contract intelligence for 20+ enterprise clients: RAG-based Q&A across large document corpora, LLM-powered entity extraction, and fine-tuned transformer models that lifted clause-extraction precision by 20%+.",
    highlights: [
      "Built and deployed RAG-based LLM applications with LangChain, Qdrant and embeddings for enterprise-scale contract Q&A.",
      "Developed LLM-powered entity extraction and synthetic datasets with LLaMA 3, improving robustness across document formats.",
      "Fine-tuned Hugging Face transformer models for clause extraction, increasing precision by 20%+.",
      "Implemented NER pipelines with spaCy and transformer models supporting 20+ enterprise clients in production.",
      "Built multi-agent GenAI workflows integrating LLMs with APIs, document systems and business logic.",
      "Shipped production AI services with Python, FastAPI and Docker, with monitoring and CI/CD.",
      "Optimized prompts and retrieval strategies for accuracy, latency and contextual relevance.",
      "Led MLOps initiatives to streamline deployment, monitoring and scaling of generative AI models.",
    ],
  },
];

export const education = {
  degree: "Bachelor of Engineering in Computer Science",
  school: "Xavier Institute of Engineering, Mumbai University",
  year: "2021",
};
