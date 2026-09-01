import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteContent } from "@/content/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(siteContent.meta.siteUrl),
  title: siteContent.meta.title,
  description: siteContent.meta.description,
  alternates: { canonical: "/" },
  applicationName: siteContent.name,
  authors: [{ name: siteContent.name }],
  creator: siteContent.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    title: siteContent.meta.title,
    description: siteContent.meta.description,
    siteName: siteContent.name,
    url: "/",
    images: [{ url: "/og.png", width: 1730, height: 909, alt: siteContent.meta.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteContent.meta.title,
    description: siteContent.meta.description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f5f5f2", colorScheme: "light dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
