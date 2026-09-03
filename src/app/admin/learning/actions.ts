"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/china-desk/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const value=(form:FormData,key:string,max=4000)=>String(form.get(key)||"").trim().slice(0,max);

export async function reviewLearningCandidate(form:FormData){const context=await requireAdmin();const id=value(form,"id",100);const status=value(form,"status",20);if(!["APPROVED","REJECTED"].includes(status))throw new Error("Invalid review decision.");const proposed=value(form,"proposed_rule",10000);let rule:unknown;try{rule=JSON.parse(proposed);}catch{throw new Error("The proposed rule must be valid JSON.");}const admin=createAdminClient();const {error}=await admin.from("learning_candidates").update({status,proposed_rule:rule,reviewed_by:context.user.id,reviewed_at:new Date().toISOString()}).eq("id",id);if(error)throw new Error(error.message);revalidatePath("/admin/learning");}
