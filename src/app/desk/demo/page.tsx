import type { Metadata } from "next";
import { DeskDemo } from "@/components/desk-demo";
import { productConfig } from "@/config/productConfig";

const title = `${productConfig.name} Opportunity Map Demo`;
const description = `A demonstration of ${productConfig.name} opportunity discovery, market intelligence, scoring, and pipeline workflow. All displayed information is demo data.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: productConfig.routes.demo },
  robots: { index: false, follow: false },
  openGraph: { type: "website", title, description, url: productConfig.routes.demo, images: [] },
  twitter: { card: "summary", title, description, images: [] },
};

export default function DeskDemoPage() {
  return <DeskDemo />;
}
