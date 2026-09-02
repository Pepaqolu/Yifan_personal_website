"use client";

import { track } from "@vercel/analytics";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { startTrial, type TrialState } from "@/app/meridian/trial/actions";

const initialState: TrialState = { message:"" };

export function TrialSignupForm({ token, organizationName }: { token:string; organizationName:string }) {
  const router=useRouter();
  const [state,action,pending]=useActionState(startTrial,initialState);
  useEffect(()=>{if(state.success&&state.destination){track("trial_started");router.push(state.destination);}},[router,state.destination,state.success]);
  return <form action={action} className="mt-10 space-y-6"><input type="hidden" name="analysis" value={token}/><label className="block"><span className="eyebrow text-stone">First name</span><input name="first_name" required autoComplete="given-name" className="mt-3 w-full rounded-xl border border-line-strong bg-soft px-4 py-3.5"/></label><label className="block"><span className="eyebrow text-stone">Company</span><input name="organization_name" required defaultValue={organizationName} autoComplete="organization" className="mt-3 w-full rounded-xl border border-line-strong bg-soft px-4 py-3.5"/></label><label className="block"><span className="eyebrow text-stone">Work email</span><input name="email" type="email" required autoComplete="email" className="mt-3 w-full rounded-xl border border-line-strong bg-soft px-4 py-3.5"/></label><label className="block"><span className="eyebrow text-stone">Password</span><input name="password" type="password" required minLength={10} autoComplete="new-password" className="mt-3 w-full rounded-xl border border-line-strong bg-soft px-4 py-3.5"/><span className="mt-2 block text-xs text-stone">At least 10 characters.</span></label>{state.message?<p role={state.success?"status":"alert"} className={`text-sm leading-6 ${state.success?"text-charcoal":"text-accent"}`}>{state.message}</p>:null}<button disabled={pending} className="w-full rounded-xl bg-accent px-5 py-4 text-sm font-semibold text-[#071018] hover:bg-ice-bright disabled:opacity-50">{pending?"Preparing your workspace…":"Start 7-day free trial →"}</button><p className="text-center text-xs leading-5 text-stone">No payment details required. Your snapshot is saved into the workspace.</p></form>;
}
