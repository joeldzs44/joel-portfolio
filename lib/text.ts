// Removes control characters (keeping line breaks) and trims.
export function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").replace(/\r\n?/g, "\n").trim() : "";
}
