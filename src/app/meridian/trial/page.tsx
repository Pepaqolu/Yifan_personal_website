import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TrialSignupForm } from "@/components/trial-signup-form";
import { productConfig } from "@/config/productConfig";
import { getSnapshotByToken } from "@/lib/analysis/data";
import { getWorkspaceContext } from "@/lib/china-desk/auth";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:`Start your free trial — ${productConfig.name}`,robots:{index:false,follow:false},openGraph:{images:[]},twitter:{images:[]}};

export default async function TrialPage({searchParams}:{searchParams:Promise<{analysis?:string}>}){
  const context=await getWorkspaceContext();
  if(context) redirect(context.profile.role==="ADMIN"?"/admin":"/meridian/app");
  const token=(await searchParams).analysis||"";
  const analysis=await getSnapshotByToken(token);
  if(!analysis||analysis.claimed_by) notFound();
  const host=analysis.company_website?new URL(analysis.company_website).hostname.replace(/^www\./,""):"";
  const organizationName=analysis.company_name||host||"";
  return <main className="min-h-screen bg-paper text-ink"><div className="page-shell grid min-h-screen gap-12 py-8 lg:grid-cols-12 lg:items-center"><section className="lg:col-span-6"><Link href="/" className="eyebrow text-accent">{productConfig.shortName.toUpperCase()}</Link><p className="mt-20 eyebrow text-stone">7-DAY FREE TRIAL</p><h1 className="mt-7 max-w-[10ch] text-[clamp(3.8rem,7vw,7rem)] font-medium leading-[0.86] tracking-[-0.075em]">Keep building your China opportunity map.</h1><p className="mt-8 max-w-xl text-lg leading-7 text-charcoal">Your snapshot will become the starting context for continuous opportunity discovery, competitor tracking, market signals and pipeline work.</p><div className="mt-10 grid grid-cols-2 gap-4 border-t border-line pt-8 text-sm text-charcoal"><p>✓ Snapshot saved</p><p>✓ Opportunity workspace</p><p>✓ Competitor tracking</p><p>✓ Weekly digest foundation</p></div></section><section className="rounded-[24px] border border-line-strong bg-elevated p-6 shadow-[var(--shadow-elevated)] sm:p-9 lg:col-span-5 lg:col-start-8"><p className="eyebrow text-accent">CREATE YOUR ACCOUNT</p><h2 className="mt-5 text-3xl font-medium tracking-[-0.05em]">Seven days of Meridian.</h2><TrialSignupForm token={token} organizationName={organizationName}/><p className="mt-6 text-center text-xs text-stone">Already have an account? <Link href={productConfig.routes.login} className="text-ink hover:text-accent">Sign in →</Link></p></section></div></main>;
}
