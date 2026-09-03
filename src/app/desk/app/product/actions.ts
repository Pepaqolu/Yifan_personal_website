"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { createClient } from "@/lib/supabase/server";
import { ProductIntelligenceService } from "@/lib/meridian-intelligence/product-service";
import { ChinaQueryPlanner } from "@/lib/meridian-intelligence/query-planner";

const value=(form:FormData,key:string,max=4000)=>String(form.get(key)||"").trim().slice(0,max);
const list=(form:FormData,key:string)=>value(form,key,3000).split(/[\n,，]/).map((item)=>item.trim()).filter(Boolean).slice(0,30);
const values=(form:FormData,key:string)=>form.getAll(key).map((item)=>String(item).trim()).filter(Boolean).slice(0,20);

export async function saveProductProfile(form:FormData) {
  const context=await requireWorkspace();
  if(!context.organization) throw new Error("A client workspace is required.");
  const profileId=value(form,"id",100);
  const objectives=values(form,"objectives");
  const service=new ProductIntelligenceService();
  const understood=service.understand({
    companyName:value(form,"company_name",240), companyUrl:value(form,"company_url",500),
    productName:value(form,"product_name",240), productDescription:value(form,"product_description"),
    intendedUse:value(form,"intended_use"), clinicalUse:value(form,"clinical_use"),
    targetCustomer:value(form,"target_customer"), targetDepartment:value(form,"target_department"),
    targetMarketSegment:value(form,"target_market_segment"), businessGoal:objectives.join(", "), objectives,
    additionalContext:value(form,"additional_context"),
    targetGeography:value(form,"target_geography",160)||"China", chinaStatus:value(form,"china_status",1000),
    keywordsEn:list(form,"keywords_en"), keywordsZh:list(form,"keywords_zh"), formalTermsZh:list(form,"formal_terms_zh"),
    procurementTermsZh:list(form,"procurement_terms_zh"), distributorTermsZh:list(form,"distributor_terms_zh"), regulatoryTermsZh:list(form,"regulatory_terms_zh"),
  });
  const supabase=await createClient();
  const payload={
    organization_id:context.organization.id, company_name:understood.companyName||null, company_url:understood.companyUrl||null,
    product_name:understood.productName, product_description:understood.productDescription||null, industry:understood.industry, industry_overlay:understood.industry,
    subindustry:understood.subindustry, intended_use:understood.intendedUse||null, clinical_use:understood.clinicalUse||null,
    target_customer:understood.targetCustomer||null, target_department:understood.targetDepartment||null,
    target_market_segment:understood.targetMarketSegment||null, business_goal:understood.businessGoal||null, objectives:understood.objectives||[], additional_context:understood.additionalContext||null,
    target_geography:understood.targetGeography||"China", china_status:understood.chinaStatus||null,
    keywords_en:understood.keywordsEn||[], keywords_zh:understood.keywordsZh||[], formal_terms_zh:understood.formalTermsZh||[],
    procurement_terms_zh:understood.procurementTermsZh||[], distributor_terms_zh:understood.distributorTermsZh||[],
    regulatory_terms_zh:understood.regulatoryTermsZh||[], related_categories:understood.relatedCategories,
    terminology_status: understood.keywordsZh?.length ? "USER_CONFIRMED" : "AI_GENERATED", created_by:context.user.id,
  };
  let id=profileId;
  if(profileId){
    const {data:before}=await supabase.from("product_profiles").select("keywords_zh,formal_terms_zh,procurement_terms_zh,distributor_terms_zh,regulatory_terms_zh").eq("id",profileId).eq("organization_id",context.organization.id).single();
    const {error}=await supabase.from("product_profiles").update(payload).eq("id",profileId).eq("organization_id",context.organization.id); if(error) throw new Error(error.message);
    if(before) await supabase.from("intelligence_corrections").insert({organization_id:context.organization.id,product_id:profileId,entity_type:"PRODUCT_PROFILE",entity_id:profileId,field_name:"china_terminology",previous_value:before,corrected_value:{keywords_zh:payload.keywords_zh,formal_terms_zh:payload.formal_terms_zh,procurement_terms_zh:payload.procurement_terms_zh,distributor_terms_zh:payload.distributor_terms_zh,regulatory_terms_zh:payload.regulatory_terms_zh},confirmation_status:"USER_CONFIRMED",corrected_by:context.user.id});
  } else {
    const {data,error}=await supabase.from("product_profiles").insert(payload).select("id").single(); if(error||!data) throw new Error(error?.message||"Product profile could not be saved."); id=data.id;
  }
  const {data:progress}=await supabase.from("analysis_progress").insert({organization_id:context.organization.id,product_id:id,stage:"QUERY_PLANNING",status:"RUNNING",completed_stages:["PRODUCT_PROFILE"],created_by:context.user.id}).select("id").single();
  const plans=new ChinaQueryPlanner().plan(understood);
  if(plans.length){
    const {error:planError}=await supabase.from("query_plans").insert(plans.map((plan)=>({organization_id:context.organization!.id,product_id:id,intent:plan.intent,query:plan.query,query_language:plan.queryLanguage,preferred_source_types:plan.preferredSourceTypes,geography:plan.geography,product_terms:plan.productTerms,rationale:plan.rationale,priority:plan.priority,created_by:context.user.id})));
    if(planError){if(progress)await supabase.from("analysis_progress").update({stage:"FAILED",status:"FAILED",error_message:planError.message}).eq("id",progress.id);throw new Error(planError.message);}
    await supabase.from("retrieval_logs").insert(plans.map((plan)=>({organization_id:context.organization!.id,product_id:id,event_type:"QUERY_GENERATED",message:plan.rationale,metadata:{intent:plan.intent,query:plan.query}})));
  }
  if(progress)await supabase.from("analysis_progress").update({stage:"COMPLETE",status:"COMPLETE",completed_stages:["PRODUCT_PROFILE","QUERY_PLANNING"]}).eq("id",progress.id);
  await supabase.from("activity").insert({organization_id:context.organization.id,actor_id:context.user.id,action:`Product profile saved: ${understood.productName}`,entity_type:"product",entity_id:id});
  revalidatePath("/meridian/app/product"); revalidatePath("/meridian/app/regulatory");
  redirect(`/meridian/app/product?id=${id}`);
}

export async function generateQueryPlan(form:FormData){
  const context=await requireWorkspace(); if(!context.organization) throw new Error("A client workspace is required.");
  const id=value(form,"id",100); const supabase=await createClient();
  const {data,error}=await supabase.from("product_profiles").select("*").eq("id",id).eq("organization_id",context.organization.id).single(); if(error||!data) throw new Error(error?.message||"Product profile not found.");
  const service=new ProductIntelligenceService();
  const profile=service.understand({productName:data.product_name,productDescription:data.product_description||"",intendedUse:data.intended_use||"",clinicalUse:data.clinical_use||"",targetCustomer:data.target_customer||"",targetDepartment:data.target_department||"",targetMarketSegment:data.target_market_segment||"",businessGoal:data.business_goal||"",targetGeography:data.target_geography,chinaStatus:data.china_status||"",keywordsEn:data.keywords_en,keywordsZh:data.keywords_zh,formalTermsZh:data.formal_terms_zh,procurementTermsZh:data.procurement_terms_zh,distributorTermsZh:data.distributor_terms_zh,regulatoryTermsZh:data.regulatory_terms_zh});
  const plans=new ChinaQueryPlanner().plan(profile);
  const {error:insertError}=await supabase.from("query_plans").insert(plans.map((plan)=>({organization_id:context.organization!.id,product_id:id,intent:plan.intent,query:plan.query,query_language:plan.queryLanguage,preferred_source_types:plan.preferredSourceTypes,geography:plan.geography,product_terms:plan.productTerms,rationale:plan.rationale,priority:plan.priority,created_by:context.user.id}))); if(insertError) throw new Error(insertError.message);
  await supabase.from("retrieval_logs").insert(plans.map((plan)=>({organization_id:context.organization!.id,product_id:id,event_type:"QUERY_GENERATED",message:plan.rationale,metadata:{intent:plan.intent,query:plan.query}})));
  revalidatePath(`/meridian/app/product?id=${id}`); revalidatePath("/meridian/app/regulatory");
}
