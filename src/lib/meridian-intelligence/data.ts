import { createClient } from "@/lib/supabase/server";

export type ProductProfile = {
  id: string; organization_id: string; company_name: string | null; company_url: string | null;
  product_name: string; product_description: string | null; industry: string; subindustry: string | null;
  intended_use: string | null; clinical_use: string | null; target_customer: string | null;
  target_department: string | null; target_market_segment: string | null; business_goal: string | null;
  objectives:string[]; additional_context:string|null; industry_overlay:string;
  target_geography: string; china_status: string | null; keywords_en: string[]; keywords_zh: string[];
  formal_terms_zh: string[]; procurement_terms_zh: string[]; distributor_terms_zh: string[];
  regulatory_terms_zh: string[]; related_categories: string[]; regulatory_notes: string | null;
  supplier_terms_zh:string[]; understanding_summary:string|null; likely_audiences:string[]; understanding_status:"DRAFT"|"CONFIRMED"|"EDITED"; understanding_mode:"WEBSITE_RETRIEVAL"|"USER_INPUT_FALLBACK"|"USER_EDITED"; understanding_confirmed_at:string|null;
  terminology_status: "AI_GENERATED" | "USER_CONFIRMED" | "ADMIN_CONFIRMED"; updated_at: string;
};
export type QueryPlanRecord = { id:string; intent:string; query:string; query_language:string; preferred_source_types:string[]; product_terms:string[]; rationale:string; priority:number; status:string; created_at:string };
export type SearchTraceRun={query_plan_id:string;status:string;result_count:number;official_source_count:number;fetch_count:number;evidence_count:number;failure_count:number;started_at:string;completed_at:string|null};
export type SearchTraceResult={query_plan_id:string;source_type:string;eligible_for_client:boolean;search_quality_score:number|null;status:string};
export type SearchTraceRecord=QueryPlanRecord&{run:SearchTraceRun|null;resultCount:number;qualifyingCount:number;sourceTypes:string[]};
export type EvidenceRecord = { id:string; opportunity_id:string|null; source_url:string; source_title:string; source_type:string; retrieved_at:string; published_at:string|null; last_verified_at:string|null; stale_after:string|null; language:string; extracted_fact:string; fact_type:string; confidence:string; confidence_score?:number|null; source_credibility_score?:number|null; verification_status:string; regulatory_relevance:string|null; commercial_relevance:string|null };
export type RegulatoryMatchRecord = { id:string; authority:string; document_name:string; document_number:string|null; document_type:string; source_url:string|null; effective_date:string|null; status:string; applicability:string; applicability_reason:string; confidence:string; applicability_score?:number|null; evidence_confidence_score?:number|null; score_breakdown?:Record<string,number>; requirements_summary:string|null; questions_to_validate:string[]; evidence_ids:string[]; last_checked_at:string };
export type FitAssessmentRecord = { opportunity_id:string; overall_assessment:string; opportunity_score?:number|null; evidence_confidence_score?:number|null; score_breakdown?:Record<string,number>; interpretation?:Record<string,unknown>; dimensions:Record<string,{score?:number;reason?:string;evidence_ids?:string[];confidence?:string}>; why_it_matters:string[]; concerns:string[]; unknowns:string[]; recommended_next_action:string|null; confidence:string };
export type ConflictRecord = { id:string; conflict_type:string; competing_claims:Array<Record<string,unknown>>; stronger_evidence_summary:string|null; relevance_score:number|null; confidence_score:number|null; suggested_action:string|null; status:string };
export type SearchFindingRecord = { id:string; query_plan_id:string; product_id:string; title:string; url:string; domain:string; snippet:string|null; source_type:string; source_authority:string; search_quality_score:number|null; score_breakdown:Record<string,number>; ranking_reasons:string[]; published_at:string|null; status:string; intent:string|null; in_pipeline:boolean };

export async function getProductProfiles(organizationId:string) {
  const supabase=await createClient();
  const {data,error}=await supabase.from("product_profiles").select("*").eq("organization_id",organizationId).order("updated_at",{ascending:false});
  if(error) throw new Error(error.message); return (data||[]) as ProductProfile[];
}
export async function getProductProfile(organizationId:string,id:string) {
  const supabase=await createClient();
  const {data,error}=await supabase.from("product_profiles").select("*").eq("organization_id",organizationId).eq("id",id).maybeSingle();
  if(error) throw new Error(error.message); return data as ProductProfile|null;
}
export async function getProductIntelligence(organizationId:string,productId:string) {
  const supabase=await createClient();
  const [queries,evidence,matches,assessments]=await Promise.all([
    supabase.from("query_plans").select("id,intent,query,query_language,preferred_source_types,product_terms,rationale,priority,status,created_at").eq("organization_id",organizationId).eq("product_id",productId).order("priority"),
    supabase.from("evidence").select("id,opportunity_id,source_url,source_title,source_type,retrieved_at,published_at,last_verified_at,stale_after,language,extracted_fact,fact_type,confidence,confidence_score,source_credibility_score,verification_status,regulatory_relevance,commercial_relevance").eq("organization_id",organizationId).eq("product_id",productId).order("retrieved_at",{ascending:false}),
    supabase.from("regulatory_matches").select("id,authority,document_name,document_number,document_type,source_url,effective_date,status,applicability,applicability_reason,confidence,applicability_score,evidence_confidence_score,score_breakdown,requirements_summary,questions_to_validate,evidence_ids,last_checked_at").eq("organization_id",organizationId).eq("product_id",productId).order("last_checked_at",{ascending:false}),
    supabase.from("opportunity_fit_assessments").select("opportunity_id,overall_assessment,opportunity_score,evidence_confidence_score,score_breakdown,interpretation,dimensions,why_it_matters,concerns,unknowns,recommended_next_action,confidence").eq("organization_id",organizationId).eq("product_id",productId),
  ]);
  const error=queries.error||evidence.error||matches.error||assessments.error; if(error) throw new Error(error.message);
  return {queries:(queries.data||[]) as QueryPlanRecord[],evidence:(evidence.data||[]) as EvidenceRecord[],matches:(matches.data||[]) as RegulatoryMatchRecord[],assessments:(assessments.data||[]) as FitAssessmentRecord[]};
}

export async function getSearchTrace(organizationId:string,productId:string){
  const supabase=await createClient();
  const [plans,runs,results]=await Promise.all([
    supabase.from("query_plans").select("id,intent,query,query_language,preferred_source_types,product_terms,rationale,priority,status,created_at").eq("organization_id",organizationId).eq("product_id",productId).order("priority"),
    supabase.from("search_runs").select("query_plan_id,status,result_count,official_source_count,fetch_count,evidence_count,failure_count,started_at,completed_at").eq("organization_id",organizationId).eq("product_id",productId).order("started_at",{ascending:false}),
    supabase.from("search_results").select("query_plan_id,source_type,eligible_for_client,search_quality_score,status").eq("organization_id",organizationId).eq("product_id",productId),
  ]);
  const error=plans.error||runs.error||results.error;if(error)throw new Error(error.message);
  const latest=new Map<string,SearchTraceRun>();for(const run of (runs.data||[]) as SearchTraceRun[])if(!latest.has(run.query_plan_id))latest.set(run.query_plan_id,run);
  const rows=(results.data||[]) as SearchTraceResult[];
  return ((plans.data||[]) as QueryPlanRecord[]).map((plan)=>{const matches=rows.filter((item)=>item.query_plan_id===plan.id);return{...plan,run:latest.get(plan.id)||null,resultCount:matches.length,qualifyingCount:matches.filter((item)=>item.eligible_for_client&&(item.search_quality_score||0)>=60).length,sourceTypes:[...new Set(matches.map((item)=>item.source_type))]} satisfies SearchTraceRecord;});
}

export async function getOpportunityIntelligence(organizationId:string,opportunityId:string){
  const supabase=await createClient();
  const [evidence,assessment,conflicts]=await Promise.all([
    supabase.from("evidence").select("id,opportunity_id,source_url,source_title,source_type,retrieved_at,published_at,last_verified_at,stale_after,language,extracted_fact,fact_type,confidence,confidence_score,source_credibility_score,verification_status,regulatory_relevance,commercial_relevance").eq("organization_id",organizationId).eq("opportunity_id",opportunityId).order("retrieved_at",{ascending:false}),
    supabase.from("opportunity_fit_assessments").select("opportunity_id,overall_assessment,opportunity_score,evidence_confidence_score,score_breakdown,interpretation,dimensions,why_it_matters,concerns,unknowns,recommended_next_action,confidence").eq("organization_id",organizationId).eq("opportunity_id",opportunityId).maybeSingle(),
    supabase.from("conflict_records").select("id,conflict_type,competing_claims,stronger_evidence_summary,relevance_score,confidence_score,suggested_action,status").eq("organization_id",organizationId).eq("opportunity_id",opportunityId).order("created_at",{ascending:false}),
  ]);
  const error=evidence.error||assessment.error||conflicts.error; if(error) throw new Error(error.message);
  return {evidence:(evidence.data||[]) as EvidenceRecord[],assessment:assessment.data as FitAssessmentRecord|null,conflicts:(conflicts.data||[]) as ConflictRecord[]};
}

export async function getOpportunityAssessments(organizationId:string){
  const supabase=await createClient();
  const {data,error}=await supabase.from("opportunity_fit_assessments").select("opportunity_id,overall_assessment,opportunity_score,evidence_confidence_score,score_breakdown,interpretation,dimensions,why_it_matters,concerns,unknowns,recommended_next_action,confidence").eq("organization_id",organizationId);
  if(error) throw new Error(error.message);
  return (data||[]) as FitAssessmentRecord[];
}

export async function getSearchFindings(organizationId:string,lower=false){
  const supabase=await createClient();
  let query=supabase.from("search_results").select("id,query_plan_id,product_id,title,url,domain,snippet,source_type,source_authority,search_quality_score,score_breakdown,ranking_reasons,published_at,status").eq("organization_id",organizationId).order("search_quality_score",{ascending:false}).limit(10);
  query=lower?query.lt("search_quality_score",60):query.eq("eligible_for_client",true).gte("search_quality_score",60);
  const {data,error}=await query;if(error)throw new Error(error.message);const rows=data||[];const planIds=[...new Set(rows.map((item)=>item.query_plan_id))];
  const [plans,partners]=await Promise.all([planIds.length?supabase.from("query_plans").select("id,intent").in("id",planIds):Promise.resolve({data:[],error:null}),supabase.from("partners").select("origin_search_result_id").eq("organization_id",organizationId).not("origin_search_result_id","is",null)]);
  const nestedError=plans.error||partners.error;if(nestedError)throw new Error(nestedError.message);const intentMap=new Map((plans.data||[]).map((item)=>[item.id,item.intent]));const pipelineIds=new Set((partners.data||[]).map((item)=>item.origin_search_result_id));
  return rows.map((item)=>({...item,intent:intentMap.get(item.query_plan_id)||null,in_pipeline:pipelineIds.has(item.id)})) as SearchFindingRecord[];
}
