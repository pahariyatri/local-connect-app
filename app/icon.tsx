import { ImageResponse } from "next/og";
import { BRAND_CONFIG } from "@/config/brandConfig";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// App Router favicon/touch-icon convention — auto-linked into <head> by
// Next.js. Same brand mark as app/opengraph-image.tsx, square-cropped.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #064e3b 100%)",
        }}
      >
        <span style={{ fontSize: 260, fontWeight: 900, color: "#34d399" }}>
          {BRAND_CONFIG.brandInitials}
        </span>
      </div>
    ),
    { ...size }
  );
}
