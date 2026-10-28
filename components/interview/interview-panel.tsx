"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { interview } from "@/content/site";
import { Turnstile } from "@/components/turnstile";
import { parseAnswer, signedHistory } from "@/lib/interview/transcript";

type Message = { role: "user" | "assistant"; content: string; cutOff?: boolean; sig?: string };

const MAX_CHARS = 500;

export function InterviewPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [verifying, setVerifying] = useState<Message[] | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    input.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [messages]);

  // Escape closes; Tab stays inside the dialog.
  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !dialog.current) return;
    const focusable = [...dialog.current.querySelectorAll<HTMLElement>("button, textarea, a[href], iframe, [tabindex]:not([tabindex='-1'])")].filter(
      (element) => !element.hasAttribute("disabled"),
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  async function send(history: Message[], turnstileToken?: string) {
    setBusy(true);
    setNotice("");
    setMessages([...history, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only answered questions go back as context, plus the new question.
        body: JSON.stringify({
          messages: [...signedHistory(history.slice(0, -1)), history.at(-1)!].map(({ role, content, sig }) => ({ role, content, sig })),
          turnstileToken,
        }),
      });
      if (res.status === 401) {
        setMessages(history);
        setVerifying(history);
        return;
      }
      if (!res.ok || !res.body) {
        const result = await res.json().catch(() => ({}));
        setMessages(history);
        setNotice(result.error ?? "The interview isn't available right now.");
        return;
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let text = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        text += value;
        setMessages([...history, { role: "assistant", ...parseAnswer(text) }]);
      }
    } catch {
      setMessages((current) => {
        const last = current.at(-1);
        return last?.role === "assistant" && last.content ? [...current.slice(0, -1), { ...last, cutOff: true }] : history;
      });
      setNotice("Connection lost. Ask again.");
    } finally {
      setBusy(false);
      input.current?.focus();
    }
  }

  function ask(question: string) {
    const content = question.trim();
    if (!content || busy) return;
    setDraft("");
    void send([...messages.filter((message) => message.content), { role: "user", content }]);
  }

  return (
    <div className="fixed inset-0 z-[80]" onKeyDown={onKeyDown}>
      <button type="button" aria-label="Close interview" tabIndex={-1} className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="interview-title"
        className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-page md:max-w-[560px]"
      >
        <header className="flex items-start justify-between gap-6 border-b border-line px-5 py-5 md:px-7">
          <div className="flex flex-col gap-1.5">
            <h2 id="interview-title" className="font-display text-2xl font-medium text-ink">
              {interview.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted">{interview.intro}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 border border-line px-3 py-1.5 text-sm text-ink hover:border-lime">
            Close
          </button>
        </header>

        <div ref={log} aria-live="polite" className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-6 md:px-7">
          {messages.length === 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-dim">Try one of these</p>
              {interview.starters.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => ask(starter)}
                  className="border border-line bg-surface px-4 py-3 text-left text-[15px] text-ink transition-colors hover:border-lime"
                >
                  {starter}
                </button>
              ))}
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={clsx(
                "max-w-[88%] whitespace-pre-wrap break-words px-4 py-3 text-[15px] leading-relaxed",
                message.role === "user" ? "self-end bg-moss text-ink" : "self-start border border-line bg-surface text-ink",
              )}
            >
              {message.content || (busy && index === messages.length - 1 ? <span className="text-dim">Thinking…</span> : null)}
              {message.cutOff && <span className="mt-2 block text-sm text-danger">The answer was cut off — ask again.</span>}
            </div>
          ))}
          {verifying && (
            <div className="flex flex-col gap-2 self-start">
              <p className="text-sm text-muted">Quick check that you&apos;re human, then I&apos;ll answer.</p>
              <Turnstile
                onToken={(token) => {
                  if (!token) return;
                  const history = verifying;
                  setVerifying(null);
                  void send(history, token);
                }}
              />
            </div>
          )}
          {notice && <p className="break-words text-sm text-danger">{notice}</p>}
        </div>

        <form
          className="flex flex-col gap-2 border-t border-line px-5 py-4 md:px-7"
          onSubmit={(event) => {
            event.preventDefault();
            ask(draft);
          }}
        >
          <label htmlFor="interview-input" className="sr-only">
            Your question
          </label>
          <div className="flex items-end gap-3">
            <textarea
              id="interview-input"
              ref={input}
              rows={2}
              value={draft}
              maxLength={MAX_CHARS}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  ask(draft);
                }
              }}
              placeholder="Ask about Joel's work…"
              className="min-h-[52px] flex-1 resize-none border border-line bg-surface px-4 py-3 text-ink placeholder:text-dim focus:border-lime focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className="h-[52px] shrink-0 border border-lime bg-lime px-5 text-sm font-medium text-lime-ink disabled:opacity-50"
            >
              Ask
            </button>
          </div>
          <div className="flex justify-between gap-4 text-xs text-dim">
            <span>{interview.disclaimer}</span>
            <span className="shrink-0 font-mono">
              {draft.length}/{MAX_CHARS}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
