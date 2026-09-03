"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { createClient } from "@/lib/supabase/server";
import { ProductIntelligenceService } from "@/lib/meridian-intelligence/product-service";
import { ChinaQueryPlanner } from "@/lib/meridian-intelligence/query-planner";
import { MeridianSearchRunner } from "@/lib/search/runner";
import { searchProviderConfiguration } from "@/lib/search/provider";
import { fetchPublicPage } from "@/lib/analysis/fetch-public-page";
import { isResearchTier, researchTiers, type ResearchTier } from "@/config/researchTiers";
import { providerCostConfig } from "@/config/researchCosts.server";
import { getTokenBalance, markResearchRunning, refundResearch, reserveResearch, settleResearch } from "@/lib/tokens/service";

const value=(form:FormData,key:string,max=4000)=>String(form.get(key)||"").trim().slice(0,max);
const list=(form:FormData,key:string)=>value(form,key,3000).split(/[\n,，]/).map((item)=>item.trim()).filter(Boolean).slice(0,30);
const values=(form:FormData,key:string)=>form.getAll(key).map((item)=>String(item).trim()).filter(Boolean).slice(0,20);

export type ProductActionState={message:string;success?:boolean;profileId?:string;preparedSearches?:number;searchStarted?:boolean;stage?:string;tokensUsed?:number;tokensReturned?:number;balance?:number;researchJobId?:string};
export type RetryActionState={message:string;success?:boolean};
export type UnderstandingState={message:string;success?:boolean;productName?:string;summary?:string;audiences?:string[];industry?:string;objectives?:string[];mode?:"WEBSITE_RETRIEVAL"|"USER_INPUT_FALLBACK"};
async function persistProductProfile(form:FormData):Promise<ProductActionState> {
  const context=await requireWorkspace();
  if(!context.organization) throw new Error("A client workspace is required.");
  const profileId=value(form,"id",100);
  const tierValue=value(form,"research_tier",20).toUpperCase();if(!isResearchTier(tierValue))throw new Error("Choose a valid research depth.");const tier=tierValue as ResearchTier;
  const requestKey=value(form,"research_request_id",100);if(!requestKey)throw new Error("Research request could not be identified. Refresh and try again.");
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
    regulatory_terms_zh:understood.regulatoryTermsZh||[], supplier_terms_zh:list(form,"supplier_terms_zh"), related_categories:understood.relatedCategories,
    understanding_summary:value(form,"understanding_summary")||understood.productDescription||understood.productName,
    likely_audiences:values(form,"likely_audiences").length?values(form,"likely_audiences"):understood.targetCustomer?[understood.targetCustomer]:[],
    understanding_status:"CONFIRMED",understanding_mode:value(form,"understanding_mode",40)||"USER_INPUT_FALLBACK",understanding_confirmed_at:new Date().toISOString(),
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
  const config=searchProviderConfiguration();
  if(!config.configured)throw new Error("Profile saved, but research cannot start until the search provider is configured. No Tokens were reserved.");
  if(providerCostConfig.braveSearch.costPerRequestUsd===null)throw new Error("Profile saved, but research cost controls are not configured. No Tokens were reserved.");
  let reservation:Awaited<ReturnType<typeof reserveResearch>>|null=null;let progress:{id:string}|null=null;
  try{reservation=await reserveResearch({productId:id,tier,idempotencyKey:requestKey});}catch(error){if(error instanceof Error&&error.message==="INSUFFICIENT_TOKENS"){const balance=await getTokenBalance();throw new Error(`MORE TOKENS REQUIRED · ${researchTiers[tier].name} requires ${researchTiers[tier].tokens} Tokens. Your available balance is ${balance?.available_tokens??0} Tokens.`);}throw error;}
  if(reservation.idempotent){const balance=await getTokenBalance();return{message:reservation.status==="SETTLED"?"This research request was already completed.":reservation.status==="REFUNDED"?"This research attempt was already refunded. Try again to begin a new request.":"This research request is already in progress.",success:reservation.status==="SETTLED",profileId:id,tokensUsed:reservation.status==="SETTLED"?reservation.tokens:0,balance:balance?.available_tokens,researchJobId:reservation.research_job_id};}
  try{
  await markResearchRunning(reservation.research_job_id);
  const progressResult=await supabase.from("analysis_progress").insert({organization_id:context.organization.id,product_id:id,research_job_id:reservation.research_job_id,stage:"QUERY_PLANNING",status:"RUNNING",completed_stages:["PRODUCT_PROFILE"],created_by:context.user.id}).select("id").single();progress=progressResult.data;
  const plans=new ChinaQueryPlanner().plan(understood);const selectedPlans=plans.slice(0,researchTiers[tier].maxSearchPaths);
  let insertedPlans:{id:string;priority:number}[]=[];
  if(selectedPlans.length){
    const {data,error:planError}=await supabase.from("query_plans").insert(selectedPlans.map((plan)=>({organization_id:context.organization!.id,product_id:id,intent:plan.intent,query:plan.query,query_language:plan.queryLanguage,preferred_source_types:plan.preferredSourceTypes,geography:plan.geography,product_terms:plan.productTerms,rationale:plan.rationale,priority:plan.priority,created_by:context.user.id}))).select("id,priority");
    if(planError){if(progress)await supabase.from("analysis_progress").update({stage:"FAILED",status:"FAILED",error_message:planError.message}).eq("id",progress.id);throw new Error(planError.message);}
    insertedPlans=(data||[]) as {id:string;priority:number}[];
    await supabase.from("retrieval_logs").insert(selectedPlans.map((plan)=>({organization_id:context.organization!.id,product_id:id,event_type:"QUERY_GENERATED",message:plan.rationale,metadata:{intent:plan.intent,query:plan.query,research_job_id:reservation!.research_job_id,research_tier:tier}})));
  }
  if(progress)await supabase.from("analysis_progress").update({stage:"QUERY_PLANNING",status:"COMPLETE",completed_stages:["PRODUCT_PROFILE","QUERY_PLANNING"]}).eq("id",progress.id);
  const runner=new MeridianSearchRunner();const completed:Awaited<ReturnType<MeridianSearchRunner["run"]>>[]=[];
  for(const [index,plan] of insertedPlans.sort((a,b)=>a.priority-b.priority).entries()){
    try{completed.push(await runner.run({organizationId:context.organization!.id,productId:id,queryPlanId:plan.id,researchJobId:reservation.research_job_id,costImportance:index===0?"ESSENTIAL":"OPTIONAL"}));}
    catch(error){if(error instanceof Error&&error.message.includes("CIRCUIT BREAKER"))break;}
  }
  if(!completed.length)throw new Error("Meridian could not complete a usable research result.");
  const results=completed.flatMap((item)=>item.results);const qualified=results.filter((item)=>item.eligibleForClient);const independent=new Set(qualified.map((item)=>item.independentSourceKey)).size;
  await settleResearch(reservation.research_job_id,{search_path_count:completed.length,result_count:results.length,qualified_finding_count:qualified.length,independent_source_count:independent});
  await supabase.rpc("save_client_onboarding",{answers:[
    {title:"Product overview",category:"Products",content:understood.productDescription||understood.productName},
    {title:"China objectives",category:"Commercial Strategy",content:objectives.join(", ")},
    {title:"Target customers",category:"Target Customers",content:understood.targetCustomer||""},
    {title:"Additional context",category:"Other Context",content:understood.additionalContext||""},
  ],skip_onboarding:false});
  await supabase.from("activity").insert({organization_id:context.organization.id,actor_id:context.user.id,action:`Product profile saved: ${understood.productName}`,entity_type:"product",entity_id:id});
  revalidatePath("/meridian/app/product"); revalidatePath("/meridian/app/regulatory");revalidatePath("/meridian/app/tokens");
  return {message:`RESEARCH COMPLETE · ${researchTiers[tier].tokens} Tokens used.`,success:true,profileId:id,preparedSearches:selectedPlans.length,searchStarted:true,stage:"EVIDENCE_REVIEW",tokensUsed:researchTiers[tier].tokens,balance:reservation.available_after,researchJobId:reservation.research_job_id};
  }catch(error){if(reservation){await refundResearch(reservation.research_job_id,error instanceof Error?error.message:"Technical research failure").catch(()=>undefined);if(progress)await supabase.from("analysis_progress").update({stage:"FAILED",status:"FAILED",error_message:error instanceof Error?error.message:"Technical research failure"}).eq("id",progress.id);}throw new Error(`${error instanceof Error?error.message:"Research could not complete."} ${reservation?`${reservation.tokens} Tokens were returned to your balance.`:""}`.trim());}
}

export async function saveProductProfile(_:ProductActionState,form:FormData):Promise<ProductActionState>{try{return await persistProductProfile(form);}catch(error){return{message:error instanceof Error?error.message:"Meridian could not save this profile.",stage:"FAILED"};}}

export async function retryProductResearch(_:RetryActionState,form:FormData):Promise<RetryActionState>{let reservation:Awaited<ReturnType<typeof reserveResearch>>|null=null;try{const context=await requireWorkspace();if(!context.organization)throw new Error("A client workspace is required.");if(!searchProviderConfiguration().configured||providerCostConfig.braveSearch.costPerRequestUsd===null)throw new Error("Research providers or cost controls are not configured.");const id=value(form,"id",100),requestKey=value(form,"research_request_id",100);const supabase=await createClient();const {data:last}=await supabase.from("research_jobs").select("research_tier").eq("organization_id",context.organization.id).eq("product_id",id).order("created_at",{ascending:false}).limit(1).maybeSingle();const tierValue=last?.research_tier||"";const tier:ResearchTier=isResearchTier(tierValue)?tierValue:"STANDARD";reservation=await reserveResearch({productId:id,tier,idempotencyKey:requestKey});if(reservation.idempotent)return{message:reservation.status==="SETTLED"?"This retry was already completed.":reservation.status==="REFUNDED"?"That retry was already refunded. Try again to start a new request.":"This retry is already in progress.",success:reservation.status==="SETTLED"};await markResearchRunning(reservation.research_job_id);const {data,error}=await supabase.from("query_plans").select("id,priority").eq("organization_id",context.organization.id).eq("product_id",id).in("status",["FAILED","PLANNED"]).order("priority").limit(researchTiers[tier].maxSearchPaths);if(error)throw new Error(error.message);if(!data?.length)throw new Error("There are no paused searches to retry.");const runner=new MeridianSearchRunner();const completed:Awaited<ReturnType<MeridianSearchRunner["run"]>>[]=[];for(const [index,plan] of data.entries()){try{completed.push(await runner.run({organizationId:context.organization!.id,productId:id,queryPlanId:plan.id,researchJobId:reservation.research_job_id,costImportance:index===0?"ESSENTIAL":"OPTIONAL"}));}catch(runError){if(runError instanceof Error&&runError.message.includes("CIRCUIT BREAKER"))break;}}if(!completed.length)throw new Error("Meridian still could not reach the required sources.");const results=completed.flatMap((item)=>item.results);await settleResearch(reservation.research_job_id,{search_path_count:completed.length,result_count:results.length,qualified_finding_count:results.filter((item)=>item.eligibleForClient).length,independent_source_count:new Set(results.filter((item)=>item.eligibleForClient).map((item)=>item.independentSourceKey)).size});revalidatePath(`/meridian/app/product?id=${id}`);revalidatePath("/meridian/app/tokens");return{message:`Research resumed ✓ ${reservation.tokens} Tokens used.`,success:true};}catch(error){if(reservation)await refundResearch(reservation.research_job_id,error instanceof Error?error.message:"Technical failure").catch(()=>undefined);return{message:`${error instanceof Error?error.message:"Research could not be retried."}${reservation?` ${reservation.tokens} Tokens were returned.`:""}`};}}

export async function prepareProductUnderstanding(_:UnderstandingState,form:FormData):Promise<UnderstandingState>{
  const url=value(form,"company_url",500),description=value(form,"product_name",1000),objectives=values(form,"objectives"),target=value(form,"target_customer",1000);
  if(!url||!description||!objectives.length)return{message:"Complete the URL, product description and at least one China objective."};
  let mode:"WEBSITE_RETRIEVAL"|"USER_INPUT_FALLBACK"="USER_INPUT_FALLBACK";
  try{const normalized=new URL(url.match(/^https?:\/\//i)?url:`https://${url}`).toString();await fetchPublicPage(normalized);mode="WEBSITE_RETRIEVAL";}catch{/* User input remains a safe, provider-independent fallback. */}
  const understood=new ProductIntelligenceService().understand({productName:description,productDescription:description,targetCustomer:target,businessGoal:objectives.join(", "),objectives,targetGeography:"China"});
  const goalAudiences:Record<string,string>={distributors:"China distributors",customers:"China buyers and end users",partners:"Commercial partners",suppliers:"China manufacturers and suppliers",competitors:"Adjacent competitors",tenders:"Procurement organizations",pricing:"China market participants",regulation:"China regulatory stakeholders"};
  const audiences=[...new Set([target,...objectives.map((goal)=>goalAudiences[goal])].filter(Boolean))].slice(0,5);
  return{message:mode==="WEBSITE_RETRIEVAL"?"Meridian combined the supplied page with your description.":"The website could not be read, so Meridian used your description without inventing details.",success:true,productName:description.slice(0,240),summary:description,audiences,industry:understood.industry,objectives,mode};
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
