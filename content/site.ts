// Profile, navigation and page copy. Edit here; every page reads from this file.

export const site = {
  name: "Joel Dsouza",
  monogram: "jd.",
  title: "Joel Dsouza — AI Engineer",
  description:
    "AI engineer in Mumbai designing and deploying LLM applications, RAG architectures and enterprise AI systems.",
  role: "Gen AI Engineer",
  location: "Mumbai",
  // Drop a PDF in /public and set this to e.g. "/Joel-Dsouza-Resume.pdf" to show a résumé link.
  resumeUrl: undefined as string | undefined,
  socials: [
    { label: "GitHub", href: "https://github.com/joeldzs44" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/joeldzs44" },
  ],
};

// `writing: true` items are hidden automatically until a published post exists.
// `match` marks the item on other pages; on the home page the item whose
// `sections` is in view is marked instead.
export const nav = [
  { label: "Home", href: "/", match: /^\/$/, sections: [] },
  { label: "Work", href: "/projects", match: /^\/projects/, sections: ["work"] },
  { label: "Skills", href: "/#skills", match: null, sections: ["skills"] },
  { label: "Experience", href: "/#experience", match: null, sections: ["experience", "certifications"] },
  { label: "Writing", href: "/writing", match: /^\/writing/, sections: [], writing: true },
] as const;

export const contactNav = { label: "Contact", href: "/#contact", sections: ["contact"] } as const;

export const home = {
  hero: {
    status: "Open to opportunities",
    location: "Mumbai, India (IST)",
    tagline: "I build production LLM systems — agents, retrieval and voice — that enterprises actually adopt.",
    intro:
      "Five years taking language models from notebooks to production: a contract intelligence platform used by 20+ clients at GEP, and a multi-channel voice and chat scheduling agent at ProjectsForce.",
    hint: "Hiring? Press I to interview my AI assistant about fit, projects and availability.",
    stats: [
      { value: "~5", label: "Years in AI" },
      { value: "10+", label: "Projects shipped" },
      { value: "50+", label: "Client adoptions" },
    ],
  },
  work: {
    label: "Selected work",
    title: "Systems I’ve built.",
    intro: "Production LLM systems from ProjectsForce and GEP — what they do, how they fit together and what I owned.",
  },
  skills: {
    label: "Toolkit",
    title: "Depth where it matters.",
    intro: "Highlighted tools are the ones I reach for first.",
  },
  experience: {
    label: "Experience",
    title: ["Research rigor.", "Engineering instinct."],
    intro:
      "Five years taking language models from notebooks to production — contract intelligence at GEP, agentic voice and chat at ProjectsForce.",
  },
  certifications: {
    label: "Continuous learning",
    title: "The learning never ships.",
    intro: "Courses and certifications I’ve completed alongside client work.",
  },
  art: {
    label: "Art commits",
    title: "Leave an art commit.",
    intro: "Draw something, tag it and leave a short note. New drawings appear once I've had a look.",
    empty: "No art commits yet — be the first.",
  },
  contact: {
    label: "Next conversation",
    title: ["Have a hard problem?", "Let’s make it tractable."],
    body: "Open to AI engineering roles and thoughtful research collaborations.",
  },
};

// The "Interview me" panel. Answers come from an AI that reads everything in content/.
export const interview = {
  title: "Interview my AI assistant",
  intro: "Ask about my experience, projects, skills or availability. Answers come from what's on this site.",
  starters: [
    "Is Joel a fit for a senior GenAI engineering role?",
    "Walk me through the Agentic Voice Assistant.",
    "What has he built with RAG and LLM agents?",
  ],
  disclaimer: "AI answers from Joel's portfolio. It can be wrong — confirm anything important with Joel.",
};

export const writingPage = {
  label: "The notebook / ideas in progress",
  title: ["Thinking,", "out loud."],
  intro: "Engineering notes, research deep dives and lessons from building AI that has to work outside the notebook.",
  stance: {
    label: "A note on these notes",
    title: "Less certainty. Better questions.",
    body: "I write to make my thinking inspectable. Research posts separate observations from hypotheses; engineering posts include trade-offs and failure modes.",
    motto: "Reproducibility over authority. Evidence over aesthetics.",
  },
};
