// The answer stream's wire format, shared by the server and the panel.
// A complete answer ends with a signature over its question and text; the
// server only accepts earlier answers that carry one, so a client can't
// invent replies to steer the model. Cut-off answers are never signed.

export const CUT_OFF = "\n[[cut-off]]";

const SIGNATURE = /\n?\[\[sig:([\w-]+)\]\]\s*$/;
// A marker whose closing brackets haven't streamed in yet.
const PARTIAL_MARKER = /\n?\[\[[^\]]*\]?$/;

export const signatureMarker = (sig: string) => `\n[[sig:${sig}]]`;

export function parseAnswer(raw: string) {
  const sig = raw.match(SIGNATURE)?.[1];
  const text = raw.replace(SIGNATURE, "");
  const cutOff = text.includes(CUT_OFF.trim());
  return { content: text.replace(CUT_OFF.trim(), "").replace(PARTIAL_MARKER, "").trim(), cutOff, sig };
}

type Turn = { role: "user" | "assistant"; content: string; sig?: string };

// Recent question-and-answer pairs the server will accept as history. Three pairs
// plus the new question fit the server's turn window and payload limit.
const HISTORY_PAIRS = 3;

export function signedHistory<T extends Turn>(messages: T[]): T[] {
  return messages
    .flatMap((message, index) => {
      const question = messages[index - 1];
      return message.role === "assistant" && message.sig && question?.role === "user" ? [question, message] : [];
    })
    .slice(-HISTORY_PAIRS * 2);
}
