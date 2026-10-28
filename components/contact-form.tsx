"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { CONTACT_LIMITS } from "@/lib/contact";
import { Turnstile } from "@/components/turnstile";

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string };
type Errors = Partial<Record<"name" | "email" | "message", string>>;

const field =
  "w-full border border-line bg-page px-4 py-3 text-ink placeholder:text-dim transition-colors focus:border-lime focus:outline-none aria-[invalid=true]:border-danger";

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const [token, setToken] = useState("");
  // Each bot-check token works once; a new widget is rendered after a failed send.
  const [attempt, setAttempt] = useState(0);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus({ state: "sending" });
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, turnstileToken: token }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        form.reset();
        setStatus({ state: "sent" });
      } else if (result.errors) {
        setErrors(result.errors);
        setStatus({ state: "idle" });
      } else {
        setStatus({ state: "error", message: result.error ?? "Couldn't send. Try again in a minute." });
        resetCheck();
      }
    } catch {
      setStatus({ state: "error", message: "Couldn't send. Check your connection and try again." });
      resetCheck();
    }
  }

  function resetCheck() {
    setToken("");
    setAttempt((count) => count + 1);
  }

  if (status.state === "sent") {
    return (
      <p role="status" className="border border-lime bg-moss p-6 text-ink">
        Message sent — I&apos;ll reply within a few days.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={errors.name}>
          <input name="name" autoComplete="name" required maxLength={CONTACT_LIMITS.name} className={field} aria-invalid={!!errors.name} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={CONTACT_LIMITS.email}
            className={field}
            aria-invalid={!!errors.email}
          />
        </Field>
      </div>
      <Field label="Message" error={errors.message}>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={CONTACT_LIMITS.message}
          className={clsx(field, "resize-y")}
          aria-invalid={!!errors.message}
        />
      </Field>
      {/* Honeypot: hidden from people, irresistible to bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <Turnstile key={attempt} onToken={setToken} />
      <div className="flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={status.state === "sending"}
          className="inline-flex h-[52px] items-center gap-7 border border-lime bg-lime px-[22px] text-sm font-medium text-lime-ink transition-colors hover:border-ink hover:bg-ink disabled:opacity-60"
        >
          {status.state === "sending" ? "Sending…" : "Send message"}
        </button>
        <p aria-live="polite" className="break-words text-sm text-danger">
          {status.state === "error" && status.message}
        </p>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-muted">
      {label}
      {children}
      {error && <span className="text-danger">{error}</span>}
    </label>
  );
}
