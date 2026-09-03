import type { Metadata } from "next";
import Link from "next/link";
import { AnalysisFlow } from "@/components/analysis-flow";
import { productConfig } from "@/config/productConfig";
import { MeridianBrand } from "@/components/meridian-brand";

export const metadata: Metadata = { title: `Analyze your China opportunity — ${productConfig.name}`, description: productConfig.description };

export default async function AnalyzePage({ searchParams }: { searchParams: Promise<{ website?: string | string[] }> }) {
  const rawWebsite = (await searchParams).website;
  const initialWebsite = (Array.isArray(rawWebsite) ? rawWebsite[0] : rawWebsite || "").slice(0, 500);
  return <main className="min-h-screen bg-paper text-ink"><header className="border-b border-line"><div className="page-shell flex h-16 items-center justify-between"><Link href="/" className="text-[0.58rem]"><MeridianBrand compact /></Link><Link href={productConfig.routes.demo} className="font-mono text-[0.6rem] uppercase tracking-[0.11em] text-stone hover:text-accent">See demo</Link></div></header><div className="page-shell"><AnalysisFlow initialWebsite={initialWebsite} /></div></main>;
}
