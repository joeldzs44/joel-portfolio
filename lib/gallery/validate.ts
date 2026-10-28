import { cleanText } from "@/lib/text";
import { ART_LIMITS, ART_SIZE, TAGS, type Tag } from "./constants";

export { ART_SIZE };

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PREFIX = "data:image/png;base64,";

type Result = { ok: true; value: { png: Buffer; tag: Tag; name: string; message: string } } | { ok: false; error: string };

export function validateSubmission(body: unknown): Result {
  const source = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  const image = typeof source.image === "string" ? source.image : "";
  if (!image.startsWith(PREFIX)) return { ok: false, error: "Drawings must be PNG images." };
  // Base64 is 4/3 the size of the bytes; reject before decoding anything huge.
  if (image.length > Math.ceil((ART_LIMITS.bytes * 4) / 3) + PREFIX.length + 4) return { ok: false, error: "That drawing is too large." };
  const png = Buffer.from(image.slice(PREFIX.length), "base64");
  if (png.length > ART_LIMITS.bytes) return { ok: false, error: "That drawing is too large." };
  if (png.length < 24 || !png.subarray(0, 8).equals(PNG_SIGNATURE) || png.toString("ascii", 12, 16) !== "IHDR")
    return { ok: false, error: "Drawings must be PNG images." };
  if (png.readUInt32BE(16) !== ART_SIZE.width || png.readUInt32BE(20) !== ART_SIZE.height)
    return { ok: false, error: "Drawings must come from the canvas on this page." };

  const tag = source.tag;
  if (typeof tag !== "string" || !(TAGS as readonly string[]).includes(tag)) return { ok: false, error: "Pick a tag for your drawing." };

  const name = cleanText(source.name);
  if (name.length > ART_LIMITS.name) return { ok: false, error: `Keep your name under ${ART_LIMITS.name} characters.` };
  const message = cleanText(source.message);
  if (message.length > ART_LIMITS.message) return { ok: false, error: `Keep the message under ${ART_LIMITS.message} characters.` };

  return { ok: true, value: { png, tag: tag as Tag, name, message } };
}
