"use client";

import { useActionState, useEffect, useState } from "react";
import { retryProductResearch, type RetryActionState } from "@/app/desk/app/product/actions";

const initial:RetryActionState={message:""};
export function ResearchRetry({productId}:{productId:string}){const [requestId,setRequestId]=useState(()=>crypto.randomUUID());const [state,action,pending]=useActionState(retryProductResearch,initial);useEffect(()=>{if(!state.message||state.success)return;const timer=window.setTimeout(()=>setRequestId(crypto.randomUUID()),0);return()=>window.clearTimeout(timer);},[state.message,state.success]);return <form action={action} className="mt-5"><input type="hidden" name="id" value={productId}/><input type="hidden" name="research_request_id" value={requestId}/><button disabled={pending||state.success} className="min-h-11 rounded-lg border border-line-strong px-4 text-sm font-medium text-ink disabled:opacity-50">{pending?"Reserving Tokens and retrying…":"Retry research →"}</button>{state.message?<p role={state.success?"status":"alert"} className={`mt-3 text-sm ${state.success?"text-jade":"text-signal-red"}`}>{state.message}</p>:null}</form>}
