"use client";

import { track } from "@vercel/analytics";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { submitAnalysisRequest, type AnalysisState } from "@/app/analyze/actions";
import { productConfig } from "@/config/productConfig";

const initialState: AnalysisState = { message: "" };
const goals = ["Customers", "Distributors", "Partners", "Suppliers", "Competitors", "Market entry"];
const buyers = ["Hospitals", "Distributors", "Manufacturers", "Retailers", "Enterprises", "Clinics", "Research institutions", "Consumers", "Other"];
const industries = ["Medical technology", "Healthcare", "Life sciences", "Industrial", "Electronics", "Consumer products", "Software", "Other"];
const statuses = ["Exploring China", "Not yet operating in China", "Already sourcing from China", "Already have distributors", "Already selling in China", "Expanding an existing China business"];

function Choice({ value, selected, onToggle, type = "checkbox" }: { value: string; selected: boolean; onToggle: () => void; type?: "checkbox" | "radio" }) {
  return <label className={`group flex min-h-14 cursor-pointer items-center justify-between rounded-xl border px-4 py-3.5 text-sm transition-[border-color,background-color,color,transform] hover:-translate-y-px ${selected ? "border-accent/45 bg-accent/[0.11] text-ink" : "border-line bg-white/[0.018] text-charcoal hover:border-line-strong hover:text-ink"}`}><span>{value}</span><input className="sr-only" type={type} checked={selected} onChange={onToggle} /><span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full transition-colors ${selected ? "bg-accent shadow-[0_0_12px_rgba(141,212,255,0.55)]" : "bg-stone/30"}`} /></label>;
}

export function AnalysisFlow() {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitAnalysisRequest, initialState);
  const [step, setStep] = useState(1);
  const [started, setStarted] = useState(false);
  const [urlTracked, setUrlTracked] = useState(false);
  const [website, setWebsite] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("Medical technology");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);
  const [buyerCustom, setBuyerCustom] = useState("");
  const [chinaStatus, setChinaStatus] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");

  useEffect(() => {
    if (state.success && state.sharePath) {
      track("analysis_completed", { request_id: state.requestId || "saved" });
      router.push(state.sharePath);
    }
  }, [router, state.requestId, state.sharePath, state.success]);

  function begin() { if (!started) { setStarted(true); track("analysis_started"); } }
  function toggle(value: string, values: string[], setter: (next: string[]) => void) { setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]); }
  function next() {
    if (step === 1 && website && !urlTracked) { track("analysis_url_entered"); setUrlTracked(true); }
    setStep((value) => Math.min(5, value + 1));
  }

  const canContinue = step === 1 ? Boolean(website.trim() || description.trim().length >= 20) : step === 2 ? selectedGoals.length > 0 : step === 3 ? Boolean(industry) : step === 4 ? Boolean(selectedBuyers.length || buyerCustom.trim()) : Boolean(chinaStatus);

  return <form action={action} onChange={begin} className="mx-auto max-w-6xl py-10 sm:py-16">
    <input type="hidden" name="website" value={website}/><input type="hidden" name="company_name" value={companyName}/><input type="hidden" name="description" value={description}/><input type="hidden" name="industry" value={industry}/>{selectedGoals.map((goal)=><input key={goal} type="hidden" name="goals" value={goal}/>) }{selectedBuyers.map((buyer)=><input key={buyer} type="hidden" name="buyers" value={buyer}/>) }<input type="hidden" name="buyer_custom" value={buyerCustom}/><input type="hidden" name="china_status" value={chinaStatus}/><input type="hidden" name="additional_context" value={additionalContext}/>

    <header className="grid gap-8 border-b border-line pb-8 sm:grid-cols-12 sm:items-end">
      <div className="sm:col-span-8"><p className="eyebrow text-accent">{productConfig.shortName.toUpperCase()} · CHINA OPPORTUNITY ANALYSIS</p><h1 className="mt-6 max-w-[13ch] text-[clamp(3.4rem,7vw,7.2rem)] font-medium leading-[0.88] tracking-[-0.072em]">What are you trying to do in China?</h1></div>
      <div className="sm:col-span-3 sm:col-start-10"><div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.12em] text-stone"><span>Step {step} of 5</span><span>{Math.round(step / 5 * 100)}%</span></div><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]"><div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{width:`${step / 5 * 100}%`}}/></div></div>
    </header>

    <div className="min-h-[34rem] py-12 sm:py-16">
      {step === 1 ? <section className="grid gap-10 lg:grid-cols-12"><div className="lg:col-span-5"><p className="eyebrow text-stone">01 · COMPANY / PRODUCT</p><h2 className="mt-6 text-[clamp(2.8rem,5vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.065em]">Show us what you sell.</h2><p className="mt-6 max-w-md leading-7 text-charcoal">Paste a public product page, describe the product manually, or do both. The page reader only accesses the URL you provide.</p></div><div className="space-y-6 lg:col-span-6 lg:col-start-7"><label className="block"><span className="eyebrow text-stone">Company or product URL</span><input value={website} onChange={(event)=>setWebsite(event.target.value.slice(0,500))} inputMode="url" autoFocus placeholder="https://company.com/product" className="mt-3 w-full rounded-xl border border-line bg-elevated px-4 py-4 text-lg outline-none focus:border-accent/50"/></label><div className="flex items-center gap-4 text-xs text-stone"><span className="h-px flex-1 bg-line"/>OR<span className="h-px flex-1 bg-line"/></div><label className="block"><span className="eyebrow text-stone">Product description</span><textarea value={description} onChange={(event)=>setDescription(event.target.value.slice(0,5000))} rows={5} placeholder="What does the product do, who uses it, and what makes it different?" className="mt-3 w-full resize-none rounded-xl border border-line bg-elevated px-4 py-4 text-lg leading-7 outline-none focus:border-accent/50"/><span className="mt-2 block text-right font-mono text-[0.58rem] text-stone">{description.length} / 5000</span></label><label className="block"><span className="eyebrow text-stone">Company name · optional</span><input value={companyName} onChange={(event)=>setCompanyName(event.target.value.slice(0,200))} placeholder="Your company" className="mt-3 w-full rounded-xl border border-line bg-elevated px-4 py-4 text-lg outline-none focus:border-accent/50"/></label></div></section> : null}
      {step === 2 ? <section><p className="eyebrow text-stone">02 · OBJECTIVE</p><h2 className="mt-6 max-w-[14ch] text-[clamp(3rem,6vw,6.2rem)] font-medium leading-[0.9] tracking-[-0.068em]">What are you looking for?</h2><p className="mt-6 text-charcoal">Choose every outcome that matters.</p><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{goals.map((goal)=><Choice key={goal} value={goal === "Competitors" ? "Understand competitors" : goal === "Market entry" ? "Evaluate China market entry" : `Find ${goal.toLowerCase()}`} selected={selectedGoals.includes(goal)} onToggle={()=>toggle(goal,selectedGoals,setSelectedGoals)}/>)}</div></section> : null}
      {step === 3 ? <section className="grid gap-10 lg:grid-cols-12"><div className="lg:col-span-5"><p className="eyebrow text-stone">03 · INDUSTRY</p><h2 className="mt-6 text-[clamp(3rem,6vw,6.2rem)] font-medium leading-[0.9] tracking-[-0.068em]">What industry are you in?</h2><p className="mt-6 max-w-md leading-7 text-charcoal">Medical technology is Meridian&apos;s initial focus, but the analysis adapts to other industries.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">{industries.map((item)=><Choice key={item} value={item} type="radio" selected={industry===item} onToggle={()=>setIndustry(item)}/>)}</div></section> : null}
      {step === 4 ? <section><p className="eyebrow text-stone">04 · TARGET BUYER</p><h2 className="mt-6 max-w-[14ch] text-[clamp(3rem,6vw,6.2rem)] font-medium leading-[0.9] tracking-[-0.068em]">Who do you want to reach?</h2><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{buyers.map((buyer)=><Choice key={buyer} value={buyer} selected={selectedBuyers.includes(buyer)} onToggle={()=>toggle(buyer,selectedBuyers,setSelectedBuyers)}/>)}</div><label className="mt-7 block max-w-2xl"><span className="eyebrow text-stone">A more specific buyer · optional</span><input value={buyerCustom} onChange={(event)=>setBuyerCustom(event.target.value.slice(0,500))} placeholder="e.g. respiratory distributors covering tertiary hospitals" className="mt-3 w-full rounded-xl border border-line bg-elevated px-4 py-4 text-lg outline-none focus:border-accent/50"/></label></section> : null}
      {step === 5 ? <section className="grid gap-10 lg:grid-cols-12"><div className="lg:col-span-5"><p className="eyebrow text-stone">05 · CHINA STATUS</p><h2 className="mt-6 text-[clamp(3rem,6vw,6.2rem)] font-medium leading-[0.9] tracking-[-0.068em]">Where are you today?</h2><label className="mt-10 block"><span className="eyebrow text-stone">Anything Meridian should know? · optional</span><textarea value={additionalContext} onChange={(event)=>setAdditionalContext(event.target.value.slice(0,4000))} rows={5} placeholder="We manufacture Class II respiratory devices and are looking for distributors covering tertiary hospitals in East China." className="mt-3 w-full resize-none rounded-xl border border-line bg-elevated px-4 py-4 leading-7 outline-none focus:border-accent/50"/></label></div><div className="grid content-start gap-3 lg:col-span-6 lg:col-start-7">{statuses.map((status)=><Choice key={status} value={status} type="radio" selected={chinaStatus===status} onToggle={()=>setChinaStatus(status)}/>)}</div></section> : null}
    </div>

    {pending ? <div role="status" aria-live="polite" className="mb-8 rounded-2xl border border-accent/25 bg-accent/[0.08] p-5"><div className="flex items-center gap-3"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent"/><p className="font-medium">Reading your context and building a structured snapshot…</p></div><p className="mt-2 text-sm text-charcoal">This may take up to a minute. Meridian will not invent missing market facts.</p></div> : null}
    {state.message && !state.success ? <p role="alert" className="mb-7 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3 text-sm text-accent">{state.message}</p> : null}
    <footer className="flex items-center justify-between border-t border-line pt-6"><button type="button" disabled={step===1 || pending} onClick={()=>setStep((value)=>Math.max(1,value-1))} className="text-sm text-stone transition-colors hover:text-ink disabled:opacity-0">← Back</button>{step < 5 ? <button type="button" disabled={!canContinue || pending} onClick={next} className="rounded-xl border border-line-strong bg-elevated px-5 py-3 text-sm font-medium transition-colors hover:border-accent/45 hover:text-accent disabled:cursor-not-allowed disabled:opacity-35">Continue →</button> : <button type="submit" disabled={!canContinue || pending} className="rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-[#071018] transition-colors hover:bg-ice-bright disabled:opacity-40">{pending ? "Building snapshot…" : "Generate China Opportunity Snapshot →"}</button>}</footer>
  </form>;
}
