import { ImageResponse } from "next/og";

export const alt = "Zohreh Sadeghi — Fullstack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0a0a",
          color: "#ededed",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 600 }}>Zohreh Sadeghi</div>
        <div style={{ fontSize: 32, marginTop: 16, color: "#a1a1aa" }}>
          Fullstack Developer — Cloud-Native — AI/RAG
        </div>
        <div style={{ fontSize: 24, marginTop: 48, color: "#71717a" }}>zohrehsadeghi.se</div>
      </div>
    ),
    { ...size },
  );
}
