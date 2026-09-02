"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/china-desk/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { retrieveIntelligencePage } from "@/lib/meridian-intelligence/retrieval";

const value=(form:FormData,key:string,max=5000)=>String(form.get(key)||"").trim().slice(0,max);
const lines=(form:FormData,key:string)=>value(form,key).split(/\n/).map((item)=>item.trim()).filter(Boolean).slice(0,30);
async function productFor(admin:ReturnType<typeof createAdminClient>,productId:string,organizationId:string){const {data}=await admin.from("product_profiles").select("id,organization_id").eq("id",productId).eq("organization_id",organizationId).maybeSingle();if(!data)throw new Error("Product does not belong to the selected organization.");return data;}

export async function ingestEvidence(form:FormData){
  await requireAdmin(); const organizationId=value(form,"organization_id",100);const productId=value(form,"product_id",100);const url=value(form,"source_url",1000);const fact=value(form,"extracted_fact");if(!organizationId||!productId||!url||!fact)throw new Error("Organization, product, URL and extracted fact are required.");
  const admin=createAdminClient();await productFor(admin,productId,organizationId);
  try{
    const page=await retrieveIntelligencePage(url);const domain=new URL(page.url).hostname.toLowerCase().replace(/^www\./,"");
    const {data:source,error:sourceError}=await admin.from("source_registry").upsert({organization_id:organizationId,name:page.title||domain,domain,source_type:page.classification.sourceType,authority_level:page.classification.authorityLevel,regulatory_authority:page.classification.regulatoryAuthority,commercial_signal_strength:page.classification.commercialSignalStrength,access_method:"WEB_PAGE",status:page.classification.status},{onConflict:"organization_id,domain"}).select("id").single();if(sourceError||!source)throw new Error(sourceError?.message||"Source could not be registered.");
    const staleAfter=new Date(Date.now()+(page.classification.sourceType==="AUTHORITATIVE"?180:90)*86400000).toISOString();
    const {error}=await admin.from("evidence").insert({organization_id:organizationId,product_id:productId,source_id:source.id,source_url:page.url,source_title:page.title||domain,source_type:page.classification.sourceType,retrieved_at:page.retrievedAt,language:/[\u3400-\u9fff]/.test(page.text)?"zh-CN":"unknown",extracted_fact:fact,fact_type:value(form,"fact_type",160)||"SOURCE_STATEMENT",confidence:value(form,"confidence",20)||"MEDIUM",verification_status:"SOURCE_CONFIRMED",regulatory_relevance:value(form,"regulatory_relevance",1000)||null,commercial_relevance:value(form,"commercial_relevance",1000)||null,authority_score:page.classification.authorityLevel==="PRIMARY"?100:page.classification.authorityLevel==="HIGH"?80:60,relevance_score:70,specificity_score:70,stale_after:staleAfter,metadata:{retrieved_text_excerpt:page.text.slice(0,1200),source_status:page.classification.status}});if(error)throw new Error(error.message);
    await admin.from("retrieval_logs").insert([{organization_id:organizationId,product_id:productId,event_type:"URL_RETRIEVED",source_url:page.url,message:`Retrieved ${page.title||domain}`},{organization_id:organizationId,product_id:productId,event_type:"EVIDENCE_EXTRACTED",source_url:page.url,message:fact}]);
  }catch(error){await admin.from("retrieval_logs").insert({organization_id:organizationId,product_id:productId,event_type:"RETRIEVAL_FAILED",source_url:url,status:"FAILED",message:error instanceof Error?error.message:"Retrieval failed"});throw error;}
  revalidatePath("/admin/medtech"); revalidatePath("/meridian/app/regulatory");
}

export async function createRegulatoryMatch(form:FormData){
  await requireAdmin();const organizationId=value(form,"organization_id",100);const productId=value(form,"product_id",100);const admin=createAdminClient();await productFor(admin,productId,organizationId);const evidenceIds=lines(form,"evidence_ids");
  const {error}=await admin.from("regulatory_matches").insert({organization_id:organizationId,product_id:productId,authority:value(form,"authority",240),document_name:value(form,"document_name",500),document_number:value(form,"document_number",160)||null,document_type:value(form,"document_type",160)||"Official guidance",source_url:value(form,"source_url",1000)||null,status:value(form,"status",40)||"UNCERTAIN",applicability:value(form,"applicability",500)||"Needs validation",applicability_reason:value(form,"applicability_reason"),confidence:value(form,"confidence",20)||"LOW",requirements_summary:value(form,"requirements_summary")||null,questions_to_validate:lines(form,"questions_to_validate"),evidence_ids:evidenceIds});if(error)throw new Error(error.message);
  await admin.from("retrieval_logs").insert({organization_id:organizationId,product_id:productId,event_type:"REGULATORY_MATCH_CREATED",message:value(form,"document_name",500)});revalidatePath("/admin/medtech");revalidatePath("/meridian/app/regulatory");
}

export async function createOpportunityCandidate(form:FormData){
  await requireAdmin();const organizationId=value(form,"organization_id",100);const productId=value(form,"product_id",100);const admin=createAdminClient();await productFor(admin,productId,organizationId);const evidenceIds=lines(form,"evidence_ids");
  const {data,error}=await admin.from("partners").insert({organization_id:organizationId,product_id:productId,company_name:value(form,"company_name",300),chinese_name:value(form,"chinese_name",300)||null,partner_type:value(form,"partner_type",100)||"DISTRIBUTOR",location:value(form,"location",200)||null,website:value(form,"website",1000)||null,description:value(form,"description")||null,status:"IDENTIFIED",source:"Meridian evidence workflow",next_action:value(form,"next_action",1000)||null,verification_status:"NOT_REQUESTED"}).select("id").single();if(error||!data)throw new Error(error?.message||"Opportunity could not be created.");
  if(evidenceIds.length){const {error:evidenceError}=await admin.from("evidence").update({opportunity_id:data.id}).in("id",evidenceIds).eq("organization_id",organizationId).eq("product_id",productId);if(evidenceError)throw new Error(evidenceError.message);}
  const why=lines(form,"why_it_matters"),unknowns=lines(form,"unknowns"),concerns=lines(form,"concerns");
  const {error:fitError}=await admin.from("opportunity_fit_assessments").insert({organization_id:organizationId,product_id:productId,opportunity_id:data.id,overall_assessment:value(form,"overall_assessment",60)||"INSUFFICIENT_EVIDENCE",why_it_matters:why,unknowns,concerns,recommended_next_action:value(form,"next_action",1000)||null,confidence:value(form,"confidence",20)||"LOW",dimensions:{evidence:{reason:`${evidenceIds.length} linked evidence item(s)`,evidence_ids:evidenceIds,confidence:value(form,"confidence",20)||"LOW"}}});if(fitError)throw new Error(fitError.message);
  await admin.from("retrieval_logs").insert([{organization_id:organizationId,product_id:productId,event_type:"OPPORTUNITY_CREATED",message:value(form,"company_name",300),metadata:{opportunity_id:data.id}},{organization_id:organizationId,product_id:productId,event_type:"ASSESSMENT_GENERATED",message:value(form,"overall_assessment",60)||"INSUFFICIENT_EVIDENCE",metadata:{opportunity_id:data.id,evidence_ids:evidenceIds}}]);revalidatePath("/admin/medtech");revalidatePath("/meridian/app/partners");
}

