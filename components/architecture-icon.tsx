import type { IconName } from "@/lib/architecture";

// Line icons for architecture diagrams, drawn on a 24px grid in the current text colour.
const paths: Record<IconName, React.ReactNode> = {
  agent: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="2" />
      <path d="M12 4.5V8" />
      <circle cx="12" cy="3.5" r="1" />
      <circle cx="9" cy="13" r="1" />
      <circle cx="15" cy="13" r="1" />
    </>
  ),
  api: <path d="M8 4C6 4 6 5.5 6 7v2c0 1.5-1 3-2 3 1 0 2 1.5 2 3v2c0 1.5 0 3 2 3M16 4c2 0 2 1.5 2 3v2c0 1.5 1 3 2 3-1 0-2 1.5-2 3v2c0 1.5 0 3-2 3" />,
  browser: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M6 6.5h.01M8.5 6.5h.01" />
    </>
  ),
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  classifier: (
    <>
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M7 12h10M10 12l7-6.2M10 12l7 6.2" />
    </>
  ),
  cloud: <path d="M7 18h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 9.2 4.5 4.5 0 0 0 7 18z" />,
  container: <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" />,
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
  document: <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" />,
  documents: <path d="M9 6h7l3 3v12H9zM16 6v3h3M6 18V3h8M12 14h4M12 17h4" />,
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  function: <path d="M6 4h3l9 16M11.5 9.5L6 20" />,
  model: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M10 10h4v4h-4zM9.5 3v4M14.5 3v4M9.5 17v4M14.5 17v4M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4" />
    </>
  ),
  phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  "phone-out": <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2zM15 3h6v6M21 3l-6 6" />,
  product: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9 9v11" />
    </>
  ),
  queue: (
    <>
      <rect x="2.5" y="8" width="4.5" height="8" rx="1" />
      <rect x="9.5" y="8" width="4.5" height="8" rx="1" />
      <path d="M16.5 12h5M19 9.5l2.5 2.5-2.5 2.5" />
    </>
  ),
  shield: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4" />,
  sms: <path d="M4 5h16v11H9l-5 4zM8 9h8M8 12h5" />,
  storage: (
    <>
      <ellipse cx="12" cy="6" rx="8" ry="2.5" />
      <path d="M4 6l2 13.5c.2 1 2.8 1.5 6 1.5s5.8-.5 6-1.5L20 6" />
    </>
  ),
};

export function ArchitectureIcon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] ?? paths.product}
    </svg>
  );
}
