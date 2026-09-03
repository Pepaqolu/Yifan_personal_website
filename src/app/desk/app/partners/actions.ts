"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { partnerStatuses } from "@/lib/china-desk/constants";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function value(form: FormData, key: string, max = 4000) { return String(form.get(key) ?? "").trim().slice(0, max); }

export type PipelineActionState={message:string;success?:boolean;alreadyAdded?:boolean};
export async function addToPipeline(_:PipelineActionState,form:FormData):Promise<PipelineActionState>{
  try{
    const context=await requireWorkspace();if(!context.organization)throw new Error("A client workspace is required.");
    const id=value(form,"id",100);if(!id)throw new Error("Opportunity not found.");
    const supabase=await createClient();
    const {data:partner,error:readError}=await supabase.from("partners").select("status,company_name").eq("id",id).eq("organization_id",context.organization.id).maybeSingle();
    if(readError||!partner)throw new Error("Opportunity not found in your workspace.");
    if(partner.status!=="IDENTIFIED")return{message:"Already in your pipeline ✓",success:true,alreadyAdded:true};
    const {error}=await supabase.from("partners").update({status:"QUALIFIED"}).eq("id",id).eq("organization_id",context.organization.id).eq("status","IDENTIFIED");if(error)throw new Error(error.message);
    await supabase.from("activity").insert({organization_id:context.organization.id,actor_id:context.user.id,action:`Added to pipeline: ${partner.company_name}`,entity_type:"partner",entity_id:id});
    revalidatePath("/meridian/app/partners");return{message:"Added to pipeline ✓",success:true};
  }catch(error){return{message:error instanceof Error?error.message:"Could not add this opportunity to the pipeline."};}
}

export async function addSearchFindingToPipeline(_:PipelineActionState,form:FormData):Promise<PipelineActionState>{
  try{const context=await requireWorkspace();if(!context.organization)throw new Error("A client workspace is required.");const id=value(form,"id",100);const supabase=await createClient();const {data,error}=await supabase.rpc("add_search_finding_to_pipeline",{target_result:id});if(error||!data)throw new Error("This finding could not be added to your pipeline.");revalidatePath("/meridian/app/partners");return{message:"Added to pipeline ✓",success:true};}catch(error){return{message:error instanceof Error?error.message:"This finding could not be added to your pipeline."};}
}

export async function updateOpportunity(form: FormData) {
  const context = await requireWorkspace();
  if (!context.organization) throw new Error("A client workspace is required.");
  const id = value(form, "id", 100);
  const status = value(form, "status", 40);
  const notes = value(form, "notes");
  const contactPerson = value(form, "contact_person", 200);
  const contactRole = value(form, "contact_role", 200);
  const email = value(form, "email", 320);
  const phone = value(form, "phone", 100);
  const wechat = value(form, "wechat", 160);
  const nextAction = value(form, "next_action", 1000);
  if (!partnerStatuses.includes(status as (typeof partnerStatuses)[number])) throw new Error("Invalid pipeline stage.");
  const supabase = await createClient();
  const { error } = await supabase.from("partners").update({ status, notes: notes || null, next_action: nextAction || null, contact_person: contactPerson || null, contact_role: contactRole || null, email: email || null, phone: phone || null, wechat: wechat || null }).eq("id", id).eq("organization_id", context.organization.id);
  if (error) throw new Error(error.message);
  await supabase.from("activity").insert({ organization_id: context.organization.id, actor_id: context.user.id, action: `Opportunity moved to ${status.replaceAll("_", " ").toLowerCase()}`, entity_type: "partner", entity_id: id });
  revalidatePath("/meridian/app/partners");
  redirect(`/meridian/app/partners?opportunity=${id}&notice=saved`);
}

export async function logOpportunityInteraction(form: FormData) {
  const context = await requireWorkspace();
  if (!context.organization) throw new Error("A client workspace is required.");
  const partnerId = value(form, "id", 100);
  const interactionType = value(form, "interaction_type", 30);
  const content = value(form, "content");
  const followUpAt = value(form, "follow_up_at", 100);
  if (!new Set(["EMAIL","WECHAT","CALL","REPLY","NOTE","REMINDER"]).has(interactionType) || !content) throw new Error("Complete the interaction record.");
  const supabase = await createClient();
  const { error } = await supabase.from("opportunity_interactions").insert({ organization_id: context.organization.id, partner_id: partnerId, interaction_type: interactionType, content, follow_up_at: followUpAt || null, created_by: context.user.id });
  if (error) throw new Error(error.message);
  revalidatePath("/meridian/app/partners");
  redirect(`/meridian/app/partners?opportunity=${partnerId}&notice=interaction`);
}

export async function requestLocalVerification(form: FormData) {
  const context = await requireWorkspace();
  if (!context.organization) throw new Error("A client workspace is required.");
  const partnerId = value(form, "id", 100);
  const productId = value(form, "product_id", 100);
  const company = value(form, "company", 240);
  const supabase = await createClient();
  const { data, error } = await supabase.from("requests").insert({ organization_id: context.organization.id, opportunity_id:partnerId, product_id:productId||null, title: `Local verification: ${company}`, description: `Verify this Meridian opportunity before further commercial action.\n\nOpportunity ID: ${partnerId}\n\nRequested checks: business registration, physical operation, relevant product portfolio, imported medical-device experience, decision-maker information and current competing brands.`, request_type: "Research a company", priority: "MEDIUM", status: "SUBMITTED", created_by: context.user.id }).select("id").single();
  if (error || !data) throw new Error(error?.message || "Verification request could not be created.");
  const admin = createAdminClient();
  const { error: verificationError } = await admin.from("partners").update({ verification_status:"REQUESTED" }).eq("id",partnerId).eq("organization_id",context.organization.id);
  if (verificationError) throw new Error(verificationError.message);
  await supabase.from("activity").insert({ organization_id: context.organization.id, actor_id: context.user.id, action: `Local verification requested: ${company}`, entity_type: "request", entity_id: data.id });
  revalidatePath("/meridian/app/partners");
  revalidatePath("/meridian/app/requests");
  redirect(`/meridian/app/partners?opportunity=${partnerId}&notice=verification`);
}

export async function recordOpportunityFeedback(form:FormData){const context=await requireWorkspace();if(!context.organization)throw new Error("A client workspace is required.");const entityId=value(form,"id",100);const feedbackType=value(form,"feedback_type",40);const allowed=new Set(["USEFUL","NOT_RELEVANT","ALREADY_KNEW","CONTACT_INCORRECT","SCORE_TOO_HIGH","SCORE_TOO_LOW","CLAIM_CONFIRMED","CLAIM_DISPUTED"]);if(!allowed.has(feedbackType))throw new Error("Invalid feedback type.");const supabase=await createClient();const detail=value(form,"detail",1000)||null;const {error}=await supabase.from("feedback_events").insert({organization_id:context.organization.id,entity_type:"OPPORTUNITY",entity_id:entityId,feedback_type:feedbackType,detail,created_by:context.user.id});if(error)throw new Error(error.message);await supabase.from("retrieval_logs").insert({organization_id:context.organization.id,event_type:"FEEDBACK_RECORDED",message:`Opportunity feedback: ${feedbackType}`,metadata:{entity_id:entityId}});
  const admin=createAdminClient();const {data:pattern}=await admin.from("feedback_events").select("organization_id").eq("entity_type","OPPORTUNITY").eq("feedback_type",feedbackType).limit(200);const organizationCount=new Set((pattern||[]).map((item)=>item.organization_id)).size;if((pattern?.length||0)>=3&&organizationCount>=2){const fingerprint=`OPPORTUNITY:${feedbackType}`;const {data:existing}=await admin.from("learning_candidates").select("id").eq("fingerprint",fingerprint).maybeSingle();if(existing)await admin.from("learning_candidates").update({evidence_count:pattern!.length,organization_count:organizationCount}).eq("id",existing.id);else await admin.from("learning_candidates").insert({fingerprint,category:"OPPORTUNITY_FEEDBACK_PATTERN",proposed_rule:{signal:feedbackType,action:"review_scoring_or_interpretation_weight"},evidence_count:pattern!.length,organization_count:organizationCount,examples:[],expected_impact:"Review whether repeated client feedback warrants a global scoring or interpretation adjustment.",scope:"GLOBAL",status:"PENDING"});await supabase.from("retrieval_logs").insert({organization_id:context.organization.id,event_type:"LEARNING_CANDIDATE_CREATED",message:"A repeated cross-organization feedback pattern is awaiting admin review.",metadata:{fingerprint}});}
  revalidatePath("/meridian/app/partners");redirect(`/meridian/app/partners?opportunity=${entityId}&notice=feedback`);}
