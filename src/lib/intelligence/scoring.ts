import { intelligenceConfig } from "@/config/intelligenceConfig";

export type ScoreBreakdown<T extends string> = Record<T, { score: number; max: number; reason: string }>;
export type SearchQualityInput = {
  intentRelevance: number; sourceCredibility: number; specificity: number; actionability: number;
  evidenceTraceability: number; freshness: number; differentiation: number;
};
export type OpportunityScoreInput = {
  productMarketFit: number; customerChannelFit: number; partnershipOpenness: number; incumbentFriction: number;
  legitimacy: number; commercialActivity: number; contactability: number; evidenceCoverage: number;
};
export type EvidenceConfidenceInput = {
  sourceCredibility: number; independentSourceCount: number; rawSourceCount: number; crossSourceAgreement: number;
  traceability: number; recency: number; specificity: number; conflictPenalty?: number; checkable?: boolean;
};
export type RegulatoryApplicabilityInput = { productMatch: number; intendedUseMatch: number; jurisdictionMatch: number; primarySourceSupport: number; uncertaintyPenalty?: number };

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const normalized = (value: number) => Math.max(0, Math.min(100, value)) / 100;
function weighted<K extends string>(input: Record<K, number>, weights: Record<K, number>) {
  return clamp((Object.keys(weights) as K[]).reduce((sum, key) => sum + normalized(input[key]) * weights[key], 0));
}

export function scoreSearchQuality(input: SearchQualityInput) {
  const score=weighted(input,intelligenceConfig.searchQualityWeights);
  return { score, eligible: score >= intelligenceConfig.resultThreshold, label: score>=90?"Priority":score>=80?"Strong":score>=70?"Useful":score>=60?"Qualifying":score>=40?"Lower confidence":"Reject / conflict only" };
}

export function scoreOpportunity(input: OpportunityScoreInput) {
  const score=weighted(input,intelligenceConfig.opportunityWeights);
  return {score,label:score>=90?"Exceptional":score>=80?"Strong":score>=70?"Promising":score>=60?"Possible":"Below normal client threshold"};
}

export function scoreEvidenceConfidence(input: EvidenceConfidenceInput) {
  const independence=Math.min(100,input.independentSourceCount*25);
  const duplicatePenalty=Math.max(0,input.rawSourceCount-input.independentSourceCount)*2;
  let score=input.sourceCredibility*.28+independence*.2+input.crossSourceAgreement*.17+input.traceability*.15+input.recency*.1+input.specificity*.1-duplicatePenalty-(input.conflictPenalty||0);
  if(input.checkable===false)score=Math.min(score,40);
  return clamp(score);
}

export function scoreRegulatoryApplicability(input: RegulatoryApplicabilityInput) {
  const score=clamp(input.productMatch*.35+input.intendedUseMatch*.3+input.jurisdictionMatch*.15+input.primarySourceSupport*.2-(input.uncertaintyPenalty||0));
  return {score,label:score>=intelligenceConfig.regulatoryThresholds.likely?"Likely applies":score>=intelligenceConfig.regulatoryThresholds.possible?"Possibly applies":"Lower-confidence detail"};
}

export function factoryVerificationCap(score:number,marketplaceOnly:boolean){return marketplaceOnly?Math.min(50,clamp(score)):clamp(score);}
