"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Loaded on first open, so pages don't ship the panel to visitors who never use it.
const InterviewPanel = dynamic(() => import("@/components/interview/interview-panel").then((m) => m.InterviewPanel), { ssr: false });

type InterviewState = { open: boolean; setOpen: (open: boolean) => void };

const InterviewContext = createContext<InterviewState | null>(null);

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) throw new Error("useInterview must be used inside InterviewProvider");
  return context;
}

function isTyping(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return !!element && (element.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName));
}

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);

  const setOpen = (next: boolean) => {
    if (next) returnFocus.current = document.activeElement as HTMLElement | null;
    setOpenState(next);
    if (!next) requestAnimationFrame(() => returnFocus.current?.focus());
  };

  // "I" opens the interview from anywhere, unless the visitor is typing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "i" || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      event.preventDefault();
      returnFocus.current = document.activeElement as HTMLElement | null;
      setOpenState(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <InterviewContext.Provider value={{ open, setOpen }}>
      {children}
      {open && <InterviewPanel onClose={() => setOpen(false)} />}
    </InterviewContext.Provider>
  );
}
