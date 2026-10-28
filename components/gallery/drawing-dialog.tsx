"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { ART_LIMITS, TAGS, type Tag } from "@/lib/gallery/constants";
import { DrawingCanvas, type DrawingCanvasHandle } from "@/components/gallery/drawing-canvas";
import { TURNSTILE_ERROR, Turnstile } from "@/components/turnstile";

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string };

const field = "w-full border border-line bg-page px-3 py-2.5 text-ink placeholder:text-dim focus:border-lime focus:outline-none";

// Native <dialog>: the browser handles focus trapping, Escape and the backdrop.
export function DrawingDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const drawing = useRef<DrawingCanvasHandle>(null);
  const [empty, setEmpty] = useState(true);
  const [tag, setTag] = useState<Tag | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  // Each bot-check token works once; a new widget is rendered after a failed send.
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<Status>({ state: "idle" });

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (empty || !tag || !drawing.current) return;
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: drawing.current.toDataURL(), tag, name, message, turnstileToken: token }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) return setStatus({ state: "sent" });
      setStatus({ state: "error", message: result.error ?? "Couldn't send your drawing. Try again." });
    } catch {
      setStatus({ state: "error", message: "Couldn't send your drawing. Check your connection and try again." });
    }
    setToken("");
    setAttempt((count) => count + 1);
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="art-dialog-title"
      onClose={onClose}
      className="m-auto max-h-[100dvh] w-full max-w-[640px] overflow-y-auto border border-line bg-surface p-0 text-ink backdrop:bg-black/70"
    >
      <div className="flex flex-col gap-6 p-5 md:p-7">
        <div className="flex items-start justify-between gap-6">
          <h2 id="art-dialog-title" className="font-display text-2xl font-medium">
            New art commit
          </h2>
          <button type="button" onClick={() => dialog.current?.close()} className="border border-line px-3 py-1.5 text-sm hover:border-lime">
            Close
          </button>
        </div>

        {status.state === "sent" ? (
          <div className="flex flex-col items-start gap-5">
            <p role="status" className="border border-lime bg-moss p-5">
              Thanks — it&apos;ll appear once Joel approves it.
            </p>
            <button type="button" onClick={() => dialog.current?.close()} className="border border-line px-4 py-2 hover:border-lime">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-5">
            <DrawingCanvas ref={drawing} onChange={setEmpty} />
            <div className="flex gap-2">
              <button type="button" onClick={() => drawing.current?.undo()} disabled={empty} className="h-8 border border-line px-3 text-sm disabled:opacity-40">
                Undo
              </button>
              <button type="button" onClick={() => drawing.current?.clear()} disabled={empty} className="h-8 border border-line px-3 text-sm disabled:opacity-40">
                Clear
              </button>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm text-muted">Tag</legend>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((value) => (
                  <label
                    key={value}
                    className={clsx(
                      "cursor-pointer border px-3 py-1.5 font-mono text-[13px] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lime",
                      tag === value ? "border-lime bg-lime text-lime-ink" : "border-line text-ink",
                    )}
                  >
                    <input type="radio" name="tag" value={value} checked={tag === value} onChange={() => setTag(value)} className="sr-only" />
                    {value}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <label className="flex flex-col gap-2 text-sm text-muted">
                Name (optional)
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={ART_LIMITS.name} className={field} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                <span className="flex justify-between">
                  Message (optional)
                  <span className="font-mono text-xs text-dim">
                    {message.length}/{ART_LIMITS.message}
                  </span>
                </span>
                <input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={ART_LIMITS.message} className={field} />
              </label>
            </div>

            <Turnstile key={attempt} onToken={setToken} onError={() => setStatus({ state: "error", message: TURNSTILE_ERROR })} />

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={empty || !tag || status.state === "sending"}
                className="h-[52px] border border-lime bg-lime px-6 text-sm font-medium text-lime-ink transition-colors hover:border-ink hover:bg-ink disabled:opacity-50"
              >
                {status.state === "sending" ? "Sending…" : "Submit for review"}
              </button>
              <p aria-live="polite" className="break-words text-sm text-danger">
                {status.state === "error" ? status.message : empty ? "" : !tag ? "Pick a tag to submit." : ""}
              </p>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
