// Shared by the drawing UI and the server-side validator.
export const TAGS = ["hire", "collab", "cheer", "note"] as const;
export type Tag = (typeof TAGS)[number];

export const ART_SIZE = { width: 480, height: 360 } as const;
export const ART_LIMITS = { bytes: 300 * 1024, name: 40, message: 140 } as const;
