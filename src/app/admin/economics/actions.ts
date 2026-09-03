"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/china-desk/auth";
import { createClient } from "@/lib/supabase/server";

const value=(form:FormData,key:string,max=500)=>String(form.get(key)||"").trim().slice(0,max);
export async function grantBetaTokens(form:FormData){await requireAdmin();const organizationId=value(form,"organization_id",100);if(!organizationId)throw new Error("Choose an organization.");const supabase=await createClient();const{data,error}=await supabase.rpc("grant_beta_promotion",{target_organization:organizationId,idempotency:"BETA_ACTIVATION"});if(error)throw new Error(error.message);revalidatePath("/admin/economics");redirect(`/admin/economics?notice=${encodeURIComponent(`Beta allocation active · 20 Tokens · expires ${new Date(data.expires_at).toLocaleDateString("en-US")}`)}`);}
export async function adjustTokens(form:FormData){await requireAdmin();const organizationId=value(form,"organization_id",100),reason=value(form,"reason",500),change=Number(value(form,"token_change",10));if(!organizationId||!Number.isInteger(change)||change===0||reason.length<3)throw new Error("Choose an organization, enter a non-zero whole number, and record a reason.");const supabase=await createClient();const{error}=await supabase.rpc("admin_adjust_token_balance",{target_organization:organizationId,token_change:change,adjustment_reason:reason,idempotency:crypto.randomUUID()});if(error)throw new Error(error.message);revalidatePath("/admin/economics");redirect(`/admin/economics?notice=${encodeURIComponent(`${change>0?"Added":"Removed"} ${Math.abs(change)} Tokens`)}`);}
