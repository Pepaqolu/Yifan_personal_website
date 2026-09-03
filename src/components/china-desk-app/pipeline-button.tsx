"use client";

import { useActionState } from "react";
import { addSearchFindingToPipeline, addToPipeline, type PipelineActionState } from "@/app/desk/app/partners/actions";

const initial:PipelineActionState={message:""};
export function PipelineButton({id,inPipeline=false,className=""}:{id:string;inPipeline?:boolean;className?:string}){
  const [state,action,pending]=useActionState(addToPipeline,inPipeline?{message:"In pipeline ✓",success:true,alreadyAdded:true}:initial);
  return <form action={action} className={className} onClick={(event)=>event.stopPropagation()}><input type="hidden" name="id" value={id}/><button disabled={pending||Boolean(state.success)} className="min-h-11 text-sm font-medium text-accent disabled:cursor-default disabled:text-jade">{pending?"Adding…":state.message||"Add to pipeline →"}</button>{state.message&&!state.success?<p role="alert" className="mt-2 text-xs text-signal-red">{state.message}</p>:null}</form>;
}

export function FindingPipelineButton({id,inPipeline=false}:{id:string;inPipeline?:boolean}){const [state,action,pending]=useActionState(addSearchFindingToPipeline,inPipeline?{message:"In pipeline ✓",success:true,alreadyAdded:true}:initial);return <form action={action}><input type="hidden" name="id" value={id}/><button disabled={pending||Boolean(state.success)} className="min-h-11 text-sm font-medium text-accent disabled:cursor-default disabled:text-jade">{pending?"Adding…":state.message||"Add to pipeline →"}</button>{state.message&&!state.success?<p role="alert" className="mt-2 text-xs text-signal-red">{state.message}</p>:null}</form>}
