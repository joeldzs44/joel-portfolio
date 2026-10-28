"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ArtCommit } from "@/lib/gallery/store";

const button = "h-9 border px-3 text-sm transition-colors disabled:opacity-50";

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const secret = new FormData(event.currentTarget).get("secret");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) router.refresh();
    else setError((await res?.json().catch(() => null))?.error ?? "Couldn't sign in.");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-muted">
        Admin secret
        <input
          name="secret"
          type="password"
          required
          autoComplete="current-password"
          className="border border-line bg-surface px-4 py-3 text-ink focus:border-lime focus:outline-none"
        />
      </label>
      <button type="submit" disabled={busy} className={`${button} h-[52px] self-start border-lime bg-lime px-6 text-lime-ink`}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </form>
  );
}

export function AdminBoard({ initial }: { initial: ArtCommit[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  // A refresh brings in new submissions and the public image URL of approved ones.
  useEffect(() => setItems(initial), [initial]);
  const [error, setError] = useState("");
  const pending = items.filter((item) => item.status === "pending");
  const approved = items.filter((item) => item.status === "approved");

  async function act(item: ArtCommit, action: "approve" | "reject" | "delete") {
    setError("");
    const previous = items;
    setItems((current) =>
      action === "approve"
        ? current.map((entry) => (entry.id === item.id ? { ...entry, status: "approved" } : entry))
        : current.filter((entry) => entry.id !== item.id),
    );
    const res = await fetch(`/api/admin/art/${item.id}`, {
      method: action === "delete" ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: action === "delete" ? undefined : JSON.stringify({ action }),
    }).catch(() => null);
    if (!res?.ok) {
      setItems(previous);
      setError((await res?.json().catch(() => null))?.error ?? "That didn't work. Try again.");
    } else if (action === "approve") {
      // The private preview link stops working once the drawing moves to the public bucket.
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-12">
      {error && <p className="text-danger">{error}</p>}
      <Group title={`Waiting for review (${pending.length})`} empty="Nothing to review.">
        {pending.map((item) => (
          <Card key={item.id} item={item}>
            <button type="button" onClick={() => act(item, "approve")} className={`${button} border-lime bg-lime text-lime-ink`}>
              Approve
            </button>
            <button type="button" onClick={() => act(item, "reject")} className={`${button} border-line text-ink hover:border-danger`}>
              Reject
            </button>
          </Card>
        ))}
      </Group>
      <Group title={`Live on the site (${approved.length})`} empty="No approved art yet.">
        {approved.map((item) => (
          <Card key={item.id} item={item}>
            <button type="button" onClick={() => act(item, "delete")} className={`${button} border-line text-ink hover:border-danger`}>
              Delete
            </button>
          </Card>
        ))}
      </Group>
    </div>
  );
}

function Group({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-2xl font-medium">{title}</h2>
      {children.length ? (
        <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">{children}</ul>
      ) : (
        <p className="text-muted">{empty}</p>
      )}
    </section>
  );
}

function Card({ item, children }: { item: ArtCommit; children: React.ReactNode }) {
  return (
    <li className="flex flex-col border border-line bg-surface">
      {/* Pending images use short-lived signed URLs. */}
      <img src={item.imageUrl} alt="" width={480} height={360} className="aspect-[4/3] w-full" />
      <div className="flex flex-col gap-3 p-4">
        <p className="break-words text-sm text-ink">
          <span className="font-mono text-lime">{item.tag}</span> · {item.name || "Anonymous"}
        </p>
        {item.message && <p className="break-words text-sm text-muted">{item.message}</p>}
        <p className="font-mono text-xs text-dim">{new Date(item.createdAt).toLocaleString("en-GB")}</p>
        <div className="flex gap-2">{children}</div>
      </div>
    </li>
  );
}
