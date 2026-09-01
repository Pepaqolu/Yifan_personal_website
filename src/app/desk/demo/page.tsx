import type { Metadata } from "next";
import { DeskDemo } from "@/components/desk-demo";

const title = "China Desk Dashboard Demo";
const description = "A front-end demonstration of the future China Desk intelligence and execution workspace. All displayed information is demo data.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/desk/demo" },
  robots: { index: false, follow: false },
  openGraph: { type: "website", title, description, url: "/desk/demo", images: [] },
  twitter: { card: "summary", title, description, images: [] },
};

export default function DeskDemoPage() {
  return <DeskDemo />;
}
