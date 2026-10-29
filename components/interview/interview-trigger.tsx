"use client";

import { useInterview } from "@/components/interview/interview-provider";

export function InterviewTrigger({ id, className, children, onOpen }: { id?: string; className?: string; children: React.ReactNode; onOpen?: () => void }) {
  const { setOpen } = useInterview();
  return (
    <button id={id} type="button" aria-haspopup="dialog" className={className} onClick={() => {
        onOpen?.();
        setOpen(true);
      }}>
      {children}
    </button>
  );
}
