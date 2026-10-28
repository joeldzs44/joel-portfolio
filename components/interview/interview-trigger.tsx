"use client";

import { useInterview } from "@/components/interview/interview-provider";

export function InterviewTrigger({ className, children, onOpen }: { className?: string; children: React.ReactNode; onOpen?: () => void }) {
  const { setOpen } = useInterview();
  return (
    <button type="button" aria-haspopup="dialog" className={className} onClick={() => {
        onOpen?.();
        setOpen(true);
      }}>
      {children}
    </button>
  );
}
