import { ImageResponse } from "next/og";

export const alt = "Orbit CV: AI resume builder";
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
          justifyContent: "space-between",
          padding: 72,
          background: "#0c0e13",
          color: "#faf7f2",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#f97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "#0c0e13",
              }}
            />
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>Orbit CV</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
            Your resume, drafted in minutes.
          </div>
          <div style={{ fontSize: 34, color: "#f97316" }}>
            AI writing. Live preview. Print-ready PDF.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
