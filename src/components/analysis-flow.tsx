"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitAnalysisRequest, type AnalysisState } from "@/app/analyze/actions";
import { productConfig } from "@/config/productConfig";

const initialState: AnalysisState = { message: "" };
const goals = ["Customers", "Distributors", "Partners", "Suppliers", "Market entry", "Competitor intelligence"];
const audiences = ["Hospitals", "Distributors", "Manufacturers", "Retailers", "Businesses", "Consumers", "Other"];
const statuses = ["Not in China yet", "Researching the market", "Already have suppliers", "Already have distributors", "Already selling in China"];

function Choice({ name, value, selected, onToggle, type = "checkbox" }: { name: string; value: string; selected: boolean; onToggle: () => void; type?: "checkbox" | "radio" }) {
  return <label className={`group flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3.5 text-sm transition-[border-color,background-color,color] ${selected ? "border-accent/40 bg-accent/[0.1] text-ink" : "border-line bg-white/[0.018] text-charcoal hover:border-line-strong hover:text-ink"}`}><span>{value}</span><input className="sr-only" name={name} value={value} type={type} checked={selected} onChange={onToggle} /><span aria-hidden="true" className={`h-2 w-2 rounded-full ${selected ? "bg-accent shadow-[0_0_10px_rgba(145,213,255,0.5)]" : "bg-stone/35"}`} /></label>;
}

export function AnalysisFlow() {
  const [state, action, pending] = useActionState(submitAnalysisRequest, initialState);
  const [step, setStep] = useState(1);
  const [started, setStarted] = useState(false);
  const [website, setWebsite] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("Medical Technology");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [chinaStatus, setChinaStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) track("analysis_completed", { request_id: state.requestId || "saved" });
  }, [state.requestId, state.success]);

  const begin = () => {
    if (!started) { setStarted(true); track("analysis_started"); }
  };
  const toggle = (value: string, values: string[], setter: (next: string[]) => void) => setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  if (state.success) {
    return <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center py-24"><p className="eyebrow text-accent">ANALYSIS REQUEST RECEIVED</p><h1 className="mt-8 text-[clamp(3.8rem,9vw,7.5rem)] font-medium leading-[0.88] tracking-[-0.075em]">Your {productConfig.shortName} analysis is being prepared.</h1><p className="mt-8 max-w-xl text-lg leading-7 text-charcoal">We have saved your company context and China goals. The current beta uses a reviewed preparation process; it does not fabricate an instant intelligence result.</p><div className="mt-12 flex flex-wrap gap-7"><Link href={productConfig.routes.demo} className="text-sm font-medium text-accent">Explore the demo →</Link><a href={`mailto:${productConfig.email}?subject=${encodeURIComponent(`${productConfig.shortName} analysis request`)}`} className="text-sm text-charcoal hover:text-ink">Contact Yifan →</a></div></section>;
  }

  const canContinue = step === 1 ? website.trim().length > 3 : step === 2 ? selectedGoals.length > 0 : step === 3 ? description.trim().length > 10 : step === 4 ? selectedAudiences.length > 0 : chinaStatus.length > 0;
  return (
    <form ref={formRef} action={action} onChange={begin} className="mx-auto max-w-5xl py-14 sm:py-20">
      <input type="hidden" name="website" value={website} />
      <input type="hidden" name="company_name" value={companyName} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="industry" value={industry} />
      {selectedGoals.map((goal)=><input key={goal} type="hidden" name="goals" value={goal} />)}
      {selectedAudiences.map((audience)=><input key={audience} type="hidden" name="audiences" value={audience} />)}
      <input type="hidden" name="china_status" value={chinaStatus} />
      <div className="flex items-center justify-between border-b border-line pb-5"><div><p className="eyebrow text-accent">{productConfig.shortName.toUpperCase()} ANALYSIS</p><p className="mt-2 text-xs text-stone">China Opportunity Map</p></div><p className="font-mono text-[0.65rem] tracking-[0.12em] text-stone">{String(step).padStart(2,"0")} / 06</p></div>
      <div className="mt-5 h-px bg-line"><div className="h-px bg-accent transition-[width] duration-500" style={{width:`${step/6*100}%`}} /></div>

      <div className="min-h-[31rem] py-14 sm:py-20">
        {step === 1 ? <section><p className="eyebrow text-stone">STEP 01 · YOUR COMPANY</p><h1 className="mt-6 max-w-[13ch] text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.07em]">Where should {productConfig.shortName} start?</h1><div className="mt-12 grid gap-7 sm:grid-cols-2"><label className="block"><span className="eyebrow text-stone">Company website or product URL *</span><input value={website} onChange={(event)=>setWebsite(event.target.value)} type="text" inputMode="url" required autoFocus placeholder="company.com/product" className="mt-3 w-full rounded-xl border border-line bg-elevated px-4 py-4 text-lg outline-none transition-colors focus:border-accent/50" /></label><label className="block"><span className="eyebrow text-stone">Company name · optional</span><input value={companyName} onChange={(event)=>setCompanyName(event.target.value)} type="text" placeholder="Your company" className="mt-3 w-full rounded-xl border border-line bg-elevated px-4 py-4 text-lg outline-none transition-colors focus:border-accent/50" /></label></div></section> : null}
        {step === 2 ? <section><p className="eyebrow text-stone">STEP 02 · CHINA GOALS</p><h1 className="mt-6 max-w-[16ch] text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.07em]">What are you looking for in China?</h1><p className="mt-6 text-charcoal">Choose every answer that applies.</p><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{goals.map((goal)=><Choice key={goal} name="goals" value={goal} selected={selectedGoals.includes(goal)} onToggle={()=>toggle(goal,selectedGoals,setSelectedGoals)} />)}</div></section> : null}
        {step === 3 ? <section><p className="eyebrow text-stone">STEP 03 · YOUR OFFERING</p><h1 className="mt-6 max-w-[15ch] text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.07em]">What do you sell?</h1><div className="mt-12 grid gap-7 sm:grid-cols-12"><label className="block sm:col-span-8"><span className="eyebrow text-stone">Product or service description *</span><textarea value={description} onChange={(event)=>setDescription(event.target.value)} required rows={5} placeholder="Describe the product, who buys it, and what makes it relevant." className="mt-3 w-full resize-none rounded-xl border border-line bg-elevated px-4 py-4 text-lg leading-7 outline-none focus:border-accent/50" /></label><label className="block sm:col-span-4"><span className="eyebrow text-stone">Industry *</span><select value={industry} onChange={(event)=>setIndustry(event.target.value)} required className="mt-3 w-full rounded-xl border border-line bg-elevated px-4 py-4 text-base outline-none focus:border-accent/50"><option>Medical Technology</option><option>Healthcare</option><option>Industrial Technology</option><option>Consumer Products</option><option>Software</option><option>Manufacturing</option><option>Other</option></select></label></div></section> : null}
        {step === 4 ? <section><p className="eyebrow text-stone">STEP 04 · TARGET AUDIENCE</p><h1 className="mt-6 max-w-[16ch] text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.07em]">Who are you trying to reach?</h1><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{audiences.map((audience)=><Choice key={audience} name="audiences" value={audience} selected={selectedAudiences.includes(audience)} onToggle={()=>toggle(audience,selectedAudiences,setSelectedAudiences)} />)}</div></section> : null}
        {step === 5 ? <section><p className="eyebrow text-stone">STEP 05 · CURRENT STATUS</p><h1 className="mt-6 max-w-[16ch] text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.07em]">Where are you in China today?</h1><div className="mt-10 grid gap-3 sm:grid-cols-2">{statuses.map((status)=><Choice key={status} name="china_status" value={status} type="radio" selected={chinaStatus===status} onToggle={()=>setChinaStatus(status)} />)}</div></section> : null}
        {step === 6 ? <section><p className="eyebrow text-stone">STEP 06 · PREPARE ANALYSIS</p><h1 className="mt-6 max-w-[16ch] text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.07em]">Ready to map your China opportunity?</h1><p className="mt-7 max-w-2xl text-lg leading-7 text-charcoal">{productConfig.shortName} will save this context as the starting point for your market snapshot, competitors, signals, opportunities and recommended actions. No live intelligence will be invented while the engine is still being connected.</p><button disabled={pending} type="submit" className="mt-12 rounded-xl bg-accent px-6 py-4 text-sm font-semibold text-[#071018] transition-colors hover:bg-ice-bright disabled:opacity-50">{pending ? "Saving your request…" : "Generate China Opportunity Map →"}</button>{state.message ? <p aria-live="polite" className="mt-6 text-sm text-accent">{state.message}</p> : null}</section> : null}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-6"><button type="button" disabled={step===1} onClick={()=>setStep((value)=>Math.max(1,value-1))} className="text-sm text-stone transition-colors hover:text-ink disabled:opacity-0">← Back</button>{step<6?<button type="button" disabled={!canContinue} onClick={()=>setStep((value)=>Math.min(6,value+1))} className="rounded-xl border border-line-strong bg-elevated px-5 py-3 text-sm font-medium transition-colors hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-35">Continue →</button>:null}</div>
    </form>
  );
}
