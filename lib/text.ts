// Removes control characters (keeping line breaks) and trims.
export function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").trim() : "";
}

// For single-line fields such as names: any run of whitespace becomes one space.
export function cleanLine(value: unknown) {
  return typeof value === "string" ? cleanText(value.replace(/\s+/g, " ")) : "";
}
