import "server-only";
import type { ChatMessage } from "./guard";

type Config = { apiKey: string; model: string; siteUrl: string };

// Streams answer text from OpenRouter. Returns the finish reason when the stream ends;
// throws if the request fails before any text arrives.
export async function* streamCompletion(
  messages: ChatMessage[],
  systemPrompt: string,
  { apiKey, model, siteUrl }: Config,
  signal?: AbortSignal,
): AsyncGenerator<string, { finishReason: string | null }> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": siteUrl,
      "X-Title": "Joel Dsouza portfolio",
    },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: 350,
      temperature: 0.3,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });
  if (!res.ok || !res.body) throw new Error(`OpenRouter responded ${res.status}`);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let finishReason: string | null = null;

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue; // comments keep the connection alive
      const data = line.slice(5).trim();
      if (data === "[DONE]") return { finishReason };
      try {
        const chunk = JSON.parse(data) as { choices?: { delta?: { content?: string }; finish_reason?: string | null }[]; error?: unknown };
        if (chunk.error) throw new Error("OpenRouter stream error");
        const choice = chunk.choices?.[0];
        if (choice?.delta?.content) yield choice.delta.content;
        if (choice?.finish_reason) finishReason = choice.finish_reason;
      } catch (error) {
        if (error instanceof SyntaxError) continue;
        throw error;
      }
    }
  }
  return { finishReason };
}
