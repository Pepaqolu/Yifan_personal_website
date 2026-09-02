import { ImageResponse } from "next/og";
import { productConfig } from "@/config/productConfig";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#070a0e",
        color: "#91d5ff",
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
      {productConfig.shortName.slice(0, 1).toUpperCase()}
    </div>,
    size,
  );
}
