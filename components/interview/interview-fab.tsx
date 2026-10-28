"use client";

import { useInterview } from "@/components/interview/interview-provider";

// A small floating button that opens the interview from anywhere on the site.
export function InterviewFab() {
  const { open, setOpen } = useInterview();
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label="Interview Joel"
      aria-keyshortcuts="I"
      title="Interview Joel (press I)"
      onClick={() => setOpen(true)}
      // Hidden rather than unmounted while the panel is open, so focus can return here on close.
      hidden={open}
      className="group fixed bottom-5 right-5 z-40 flex [&[hidden]]:hidden h-11 items-center rounded-full border border-line bg-page/90 px-3 text-sm text-ink shadow-[0_6px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors hover:border-lime hover:text-lime focus-visible:border-lime md:bottom-8 md:right-8"
    >
      <svg aria-hidden viewBox="0 0 20 20" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M3.5 5.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-3.5 3v-3a2 2 0 0 1-2-2z" />
        <circle cx="7.5" cy="8.5" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="10" cy="8.5" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="12.5" cy="8.5" r="0.6" fill="currentColor" stroke="none" />
      </svg>
      <span className="max-w-0 pl-0 group-hover:pl-2 group-focus-visible:pl-2 overflow-hidden whitespace-nowrap transition-[max-width,padding] duration-300 ease-out group-hover:max-w-[8rem] group-focus-visible:max-w-[8rem] motion-reduce:transition-none">
        Interview me
      </span>
    </button>
  );
}
