import "server-only";
import { getServerEnv } from "./env";

// Sends a plain-text email to Joel through Resend. The recipient only ever
// comes from CONTACT_TO_EMAIL, never from the request.
export async function sendEmail({ subject, text, replyTo }: { subject: string; text: string; replyTo?: string }) {
  const config = getServerEnv().resend;
  if (!config) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: config.from, to: [config.to], subject, text, ...(replyTo && { reply_to: replyTo }) }),
    });
    if (!res.ok) console.error("email", res.status, (await res.json().catch(() => null))?.message);
    return res.ok;
  } catch (error) {
    console.error("email", error instanceof Error ? error.message : error);
    return false;
  }
}
