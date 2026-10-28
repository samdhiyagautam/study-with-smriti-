import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — Online live classes for Classes 8, 9 & 10`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

const SUBJECTS = ["Maths", "Science", "English", "Hindi", "Computer", "SST"];

/**
 * Branded 1200x630 social preview. This file sits at the app root, so Next
 * cascades it as the OG/Twitter image for every page that does not declare
 * its own.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #101311 0%, #22305C 48%, #2E7D32 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "#8BC53F",
              color: "#16295B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: 800,
            }}
          >
            S
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              opacity: 0.95,
            }}
          >
            Study with Smriti
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "76px", fontWeight: 800, lineHeight: 1.15 }}>
            Online live classes for
          </div>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#A9DB5F",
            }}
          >
            Classes 8, 9 &amp; 10
          </div>
          <div
            style={{
              marginTop: "28px",
              fontSize: "34px",
              fontWeight: 500,
              opacity: 0.9,
            }}
          >
            {SUBJECTS.join("  ·  ")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "28px",
            opacity: 0.92,
          }}
        >
          <div style={{ display: "flex" }}>
            For government school students — Bokaro, Jharkhand
          </div>
          <div style={{ display: "flex", color: "#CDE9A5", fontWeight: 700 }}>
            Now get ready to win
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
