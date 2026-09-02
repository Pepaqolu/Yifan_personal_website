import { createClient } from "@/lib/supabase/server";

export type ProductProfile = {
  id: string; organization_id: string; company_name: string | null; company_url: string | null;
  product_name: string; product_description: string | null; industry: string; subindustry: string | null;
  intended_use: string | null; clinical_use: string | null; target_customer: string | null;
  target_department: string | null; target_market_segment: string | null; business_goal: string | null;
  target_geography: string; china_status: string | null; keywords_en: string[]; keywords_zh: string[];
  formal_terms_zh: string[]; procurement_terms_zh: string[]; distributor_terms_zh: string[];
  regulatory_terms_zh: string[]; related_categories: string[]; regulatory_notes: string | null;
  terminology_status: "AI_GENERATED" | "USER_CONFIRMED" | "ADMIN_CONFIRMED"; updated_at: string;
};
export type QueryPlanRecord = { id:string; intent:string; query:string; query_language:string; preferred_source_types:string[]; rationale:string; priority:number; status:string; created_at:string };
export type EvidenceRecord = { id:string; opportunity_id:string|null; source_url:string; source_title:string; source_type:string; retrieved_at:string; published_at:string|null; last_verified_at:string|null; stale_after:string|null; language:string; extracted_fact:string; fact_type:string; confidence:string; verification_status:string; regulatory_relevance:string|null; commercial_relevance:string|null };
export type RegulatoryMatchRecord = { id:string; authority:string; document_name:string; document_number:string|null; document_type:string; source_url:string|null; effective_date:string|null; status:string; applicability:string; applicability_reason:string; confidence:string; requirements_summary:string|null; questions_to_validate:string[]; evidence_ids:string[]; last_checked_at:string };
export type FitAssessmentRecord = { opportunity_id:string; overall_assessment:string; dimensions:Record<string,{score?:number;reason?:string;evidence_ids?:string[];confidence?:string}>; why_it_matters:string[]; concerns:string[]; unknowns:string[]; recommended_next_action:string|null; confidence:string };

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
    supabase.from("query_plans").select("id,intent,query,query_language,preferred_source_types,rationale,priority,status,created_at").eq("organization_id",organizationId).eq("product_id",productId).order("priority"),
    supabase.from("evidence").select("id,opportunity_id,source_url,source_title,source_type,retrieved_at,published_at,last_verified_at,stale_after,language,extracted_fact,fact_type,confidence,verification_status,regulatory_relevance,commercial_relevance").eq("organization_id",organizationId).eq("product_id",productId).order("retrieved_at",{ascending:false}),
    supabase.from("regulatory_matches").select("id,authority,document_name,document_number,document_type,source_url,effective_date,status,applicability,applicability_reason,confidence,requirements_summary,questions_to_validate,evidence_ids,last_checked_at").eq("organization_id",organizationId).eq("product_id",productId).order("last_checked_at",{ascending:false}),
    supabase.from("opportunity_fit_assessments").select("opportunity_id,overall_assessment,dimensions,why_it_matters,concerns,unknowns,recommended_next_action,confidence").eq("organization_id",organizationId).eq("product_id",productId),
  ]);
  const error=queries.error||evidence.error||matches.error||assessments.error; if(error) throw new Error(error.message);
  return {queries:(queries.data||[]) as QueryPlanRecord[],evidence:(evidence.data||[]) as EvidenceRecord[],matches:(matches.data||[]) as RegulatoryMatchRecord[],assessments:(assessments.data||[]) as FitAssessmentRecord[]};
}

export async function getOpportunityIntelligence(organizationId:string,opportunityId:string){
  const supabase=await createClient();
  const [evidence,assessment]=await Promise.all([
    supabase.from("evidence").select("id,opportunity_id,source_url,source_title,source_type,retrieved_at,published_at,last_verified_at,stale_after,language,extracted_fact,fact_type,confidence,verification_status,regulatory_relevance,commercial_relevance").eq("organization_id",organizationId).eq("opportunity_id",opportunityId).order("retrieved_at",{ascending:false}),
    supabase.from("opportunity_fit_assessments").select("opportunity_id,overall_assessment,dimensions,why_it_matters,concerns,unknowns,recommended_next_action,confidence").eq("organization_id",organizationId).eq("opportunity_id",opportunityId).maybeSingle(),
  ]);
  const error=evidence.error||assessment.error; if(error) throw new Error(error.message);
  return {evidence:(evidence.data||[]) as EvidenceRecord[],assessment:assessment.data as FitAssessmentRecord|null};
}
