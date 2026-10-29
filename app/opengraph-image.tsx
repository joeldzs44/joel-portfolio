import { ImageResponse } from "next/og";
import { site } from "@/content/site";

// The preview card shown when a link to the site is shared. Pages without their own image use this one.

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 80,
          background: "#101210",
          color: "#f0f2e9",
          borderBottom: "12px solid #c5f46b",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, color: "#c5f46b" }}>{site.monogram}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 112, fontWeight: 500, letterSpacing: -2 }}>
            {site.name}
            <span style={{ color: "#c5f46b" }}>.</span>
          </div>
          <div style={{ display: "flex", fontSize: 40, color: "#a7afa3", marginTop: 16 }}>
            {site.role} in {site.location} · LLMs, RAG and agents
          </div>
        </div>
      </div>
    ),
    size,
  );
}
