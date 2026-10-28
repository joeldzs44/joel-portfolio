import { describe, expect, it } from "vitest";
import { ART_SIZE, validateSubmission } from "./validate";

// Minimal PNG: signature + IHDR chunk header carrying width/height, padded to a size.
function png(width: number, height: number, bytes = 4000) {
  const buffer = Buffer.alloc(bytes);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write("IHDR", 12, "ascii");
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

const valid = { image: png(ART_SIZE.width, ART_SIZE.height), tag: "cheer", name: "Ada", message: "Nice site!" };

describe("validateSubmission", () => {
  it("accepts a 480×360 PNG with a known tag", () => {
    const result = validateSubmission(valid);
    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toMatchObject({ tag: "cheer", name: "Ada", message: "Nice site!" });
  });

  it("keeps the name on one line", () => {
    const result = validateSubmission({ ...valid, name: "Ada\nLovelace" });
    expect(result.ok && result.value.name).toBe("Ada Lovelace");
  });

  it("rejects a JPEG data URL", () => {
    expect(validateSubmission({ ...valid, image: valid.image.replace("image/png", "image/jpeg") }).ok).toBe(false);
  });

  it("rejects bytes that aren't a PNG", () => {
    const fake = `data:image/png;base64,${Buffer.from("not a png at all".repeat(300)).toString("base64")}`;
    expect(validateSubmission({ ...valid, image: fake }).ok).toBe(false);
  });

  it("rejects the wrong dimensions", () => {
    expect(validateSubmission({ ...valid, image: png(481, 360) }).ok).toBe(false);
  });

  it("rejects images over 300 KB", () => {
    expect(validateSubmission({ ...valid, image: png(480, 360, 301 * 1024) }).ok).toBe(false);
  });

  it("rejects an unknown tag", () => {
    expect(validateSubmission({ ...valid, tag: "spam" }).ok).toBe(false);
  });

  it("rejects a name over 40 characters", () => {
    expect(validateSubmission({ ...valid, name: "a".repeat(41) }).ok).toBe(false);
  });

  it("rejects a message over 140 characters", () => {
    expect(validateSubmission({ ...valid, message: "a".repeat(141) }).ok).toBe(false);
  });

  it("allows an empty name and message", () => {
    expect(validateSubmission({ ...valid, name: "", message: "" }).ok).toBe(true);
  });
});
