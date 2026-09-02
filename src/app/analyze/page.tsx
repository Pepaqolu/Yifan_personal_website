import type { Metadata } from "next";
import Link from "next/link";
import { AnalysisFlow } from "@/components/analysis-flow";
import { productConfig } from "@/config/productConfig";

export const metadata: Metadata = { title: `Analyze your China opportunity — ${productConfig.name}`, description: productConfig.description };

export default async function AnalyzePage({ searchParams }: { searchParams: Promise<{ website?: string | string[] }> }) {
  const rawWebsite = (await searchParams).website;
  const initialWebsite = (Array.isArray(rawWebsite) ? rawWebsite[0] : rawWebsite || "").slice(0, 500);
  return <main className="min-h-screen bg-paper text-ink"><header className="border-b border-line"><div className="page-shell flex h-16 items-center justify-between"><Link href="/" className="flex items-center gap-2.5 text-[0.68rem] font-semibold tracking-[0.08em]"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{productConfig.shortName.toUpperCase()}</Link><Link href={productConfig.routes.demo} className="font-mono text-[0.6rem] uppercase tracking-[0.11em] text-stone hover:text-accent">See demo</Link></div></header><div className="page-shell"><AnalysisFlow initialWebsite={initialWebsite} /></div></main>;
}
