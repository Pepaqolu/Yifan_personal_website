import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteContent } from "@/content/site";
import { Analytics } from "@vercel/analytics/next";
import { productConfig } from "@/config/productConfig";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(siteContent.meta.siteUrl),
  title: `${productConfig.name} — ${productConfig.tagline}`,
  description: productConfig.description,
  alternates: { canonical: "/" },
  applicationName: productConfig.name,
  authors: [{ name: siteContent.name }],
  creator: siteContent.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    title: `${productConfig.name} — ${productConfig.tagline}`,
    description: productConfig.description,
    siteName: productConfig.name,
    url: "/",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: `${productConfig.name} — ${productConfig.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${productConfig.name} — ${productConfig.tagline}`,
    description: productConfig.description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#070a0e", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
