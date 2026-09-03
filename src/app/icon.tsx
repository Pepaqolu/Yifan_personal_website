import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function Icon() {
  const logo = await readFile(join(process.cwd(), "public", "brand", "meridian-logo.png"));
  return new ImageResponse(
    <img src={logo.buffer as unknown as string} width={64} height={64} alt="" />,
    size,
  );
}
