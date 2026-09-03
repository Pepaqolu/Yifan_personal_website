"use client";

import { useActionState } from "react";
import { retryProductResearch, type RetryActionState } from "@/app/desk/app/product/actions";

const initial:RetryActionState={message:""};
export function ResearchRetry({productId}:{productId:string}){const [state,action,pending]=useActionState(retryProductResearch,initial);return <form action={action} className="mt-5"><input type="hidden" name="id" value={productId}/><button disabled={pending} className="min-h-11 rounded-lg border border-line-strong px-4 text-sm font-medium text-ink disabled:opacity-50">{pending?"Retrying saved research…":"Retry research →"}</button>{state.message?<p role={state.success?"status":"alert"} className={`mt-3 text-sm ${state.success?"text-jade":"text-signal-red"}`}>{state.message}</p>:null}</form>}
