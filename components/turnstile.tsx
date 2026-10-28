"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile bot check. Renders nothing when no site key is configured
// (local development), in which case the server skips verification outside production.
// onError fires when the check can't run: the script is blocked or, in production,
// the site key is missing.

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | undefined;

function loadScript() {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = undefined;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export const TURNSTILE_ERROR = "The human check couldn't load. Allow challenges.cloudflare.com in your content blocker, or reload the page.";

export function Turnstile({ onToken, onError }: { onToken: (token: string) => void; onError?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  const fail = useRef(onError);
  fail.current = onError;

  useEffect(() => {
    if (!SITE_KEY) {
      if (process.env.NODE_ENV === "production") fail.current?.();
      return;
    }
    let id: string | undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        id = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          theme: "dark",
          appearance: "interaction-only",
          callback: (token: string) => callback.current(token),
          "expired-callback": () => callback.current(""),
          "error-callback": () => fail.current?.(),
        });
      })
      .catch(() => fail.current?.());
    return () => {
      cancelled = true;
      if (id) window.turnstile?.remove(id);
    };
  }, []);

  return SITE_KEY ? <div ref={ref} /> : null;
}
