import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#111111",
        color: "#f5f5f2",
        display: "flex",
        fontFamily: "sans-serif",
        fontSize: 25,
        fontWeight: 600,
        height: "100%",
        justifyContent: "center",
        letterSpacing: "-0.08em",
        width: "100%",
      }}
    >
      YF
    </div>,
    size,
  );
}
