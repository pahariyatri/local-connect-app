import { ImageResponse } from "next/og";
import { BRAND_CONFIG } from "@/config/brandConfig";

export const runtime = "edge";
export const alt = BRAND_CONFIG.fullProductName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Server-rendered social-preview image (Satori/next-og) — sitewide default
// for every route that doesn't define its own. No binary asset to keep in
// sync with the brand name/tagline; this always matches config/brandConfig.ts.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #064e3b 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -100,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(16,185,129,0.25)",
            filter: "blur(10px)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "rgba(16,185,129,0.15)",
            border: "2px solid rgba(16,185,129,0.4)",
            marginBottom: 36,
          }}
        >
          <span style={{ fontSize: 44, fontWeight: 900, color: "#34d399" }}>
            {BRAND_CONFIG.brandInitials}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 900,
            color: "#f8fafc",
            letterSpacing: "-0.02em",
          }}
        >
          {BRAND_CONFIG.parentBrandName}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 30,
            fontWeight: 500,
            color: "#a7f3d0",
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          {BRAND_CONFIG.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
