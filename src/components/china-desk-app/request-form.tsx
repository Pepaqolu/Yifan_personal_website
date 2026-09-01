"use client";

import { useActionState } from "react";
import { createRequest, type RequestState } from "@/app/desk/app/actions";
import { priorities, requestTypes } from "@/lib/china-desk/constants";

const initialState: RequestState = { message: "" };
export function RequestForm() {
  const [state, action, pending] = useActionState(createRequest, initialState);
  return <form action={action} className="border-t border-line py-8"><div className="grid gap-6 md:grid-cols-2"><label><span className="eyebrow text-stone">Request type</span><select name="request_type" className="mt-3 w-full border-b border-ink/20 bg-transparent pb-3 text-sm outline-none">{requestTypes.map(item=><option key={item}>{item}</option>)}</select></label><label><span className="eyebrow text-stone">Priority</span><select name="priority" className="mt-3 w-full border-b border-ink/20 bg-transparent pb-3 text-sm outline-none">{priorities.map(item=><option key={item}>{item}</option>)}</select></label></div><label className="mt-8 block"><span className="eyebrow text-stone">Title</span><input name="title" required className="mt-3 w-full border-b border-ink/20 bg-transparent pb-3 text-2xl font-medium outline-none" placeholder="What do you need?" /></label><label className="mt-8 block"><span className="eyebrow text-stone">Context</span><textarea name="description" required rows={5} className="mt-3 w-full resize-y border-b border-ink/20 bg-transparent pb-3 leading-7 outline-none" placeholder="Describe the question, decision, company, or outcome." /></label>{state.message ? <p aria-live="polite" className={`mt-6 text-sm ${state.success ? "text-stone" : "text-accent"}`}>{state.message}</p> : null}<button disabled={pending} className="mt-8 border-b border-ink/25 pb-1.5 text-sm font-medium disabled:opacity-50">{pending ? "Submitting" : "Submit request →"}</button></form>;
}
