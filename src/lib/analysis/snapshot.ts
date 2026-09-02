import "server-only";

import type { OpportunitySnapshot } from "@/lib/ai/types";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("The analysis response did not match the required structure.");
  return value as Record<string, unknown>;
}

function string(value: unknown, fallback = "", max = 700) {
  return typeof value === "string" ? value.trim().slice(0, max) : fallback;
}

function strings(value: unknown, maxItems = 8, maxLength = 420) {
  return Array.isArray(value) ? value.map((item) => string(item, "", maxLength)).filter(Boolean).slice(0, maxItems) : [];
}

function score(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.round(parsed))) : 0;
}

export function validateOpportunitySnapshot(value: unknown): OpportunitySnapshot {
  const root = record(value);
  const understanding = record(root.companyUnderstanding);
  const opportunity = record(root.opportunityScore);
  const factors = Array.isArray(opportunity.factors) ? opportunity.factors.map((item) => {
    const factor = record(item);
    return { label: string(factor.label, "Assessment factor", 120), score: score(factor.score), rationale: string(factor.rationale, "Evidence requires validation.") };
  }).filter((item) => item.label && item.rationale).slice(0, 5) : [];
  const buyerTypes = Array.isArray(root.bestFitBuyerTypes) ? root.bestFitBuyerTypes.map((item) => {
    const buyer = record(item);
    return { type: string(buyer.type, "Buyer type to validate", 160), why: string(buyer.why, "Relevance requires validation.") };
  }).slice(0, 6) : [];
  const search = Array.isArray(root.chineseSearchStrategy) ? root.chineseSearchStrategy.map((item) => {
    const group = record(item);
    return { category: string(group.category, "Search terms", 120), terms: strings(group.terms, 8, 100) };
  }).filter((item) => item.terms.length).slice(0, 6) : [];
  const risks = Array.isArray(root.keyRisks) ? root.keyRisks.map((item) => {
    const risk = record(item);
    return { risk: string(risk.risk, "Risk to validate", 140), why: string(risk.why, "Evidence is required.") };
  }).slice(0, 7) : [];
  const actions = Array.isArray(root.recommendedActions) ? root.recommendedActions.map((item) => {
    const action = record(item);
    return { action: string(action.action, "Validate the next commercial assumption", 180), why: string(action.why, "This reduces uncertainty.") };
  }).slice(0, 5) : [];
  const rawMode = string(root.mode);
  const mode: OpportunitySnapshot["mode"] = rawMode === "SOURCING" || rawMode === "HYBRID" ? rawMode : "MARKET_ENTRY";
  let sourcing: OpportunitySnapshot["sourcing"];
  if (root.sourcing) {
    const raw = record(root.sourcing);
    sourcing = { likelyRegions: strings(raw.likelyRegions), supplierArchetypes: strings(raw.supplierArchetypes), moqConsiderations: strings(raw.moqConsiderations), dueDiligenceChecklist: strings(raw.dueDiligenceChecklist) };
  }
  if (factors.length < 4 || buyerTypes.length < 1 || search.length < 1 || risks.length < 2 || actions.length !== 5) throw new Error("The analysis response was incomplete. Please try again.");
  return {
    mode,
    companyUnderstanding: { company: string(understanding.company, "Company name not supplied", 200), product: string(understanding.product, "Product requires clarification", 500), summary: string(understanding.summary, "Understanding requires clarification."), likelyBuyer: string(understanding.likelyBuyer, "Buyer type requires validation", 300) },
    verifiedInformation: strings(root.verifiedInformation, 8),
    opportunityScore: { total: score(opportunity.total), label: string(opportunity.label, "VALIDATION NEEDED", 100).toUpperCase(), factors },
    bestFitBuyerTypes: buyerTypes,
    competitiveLandscape: strings(root.competitiveLandscape, 7),
    chineseSearchStrategy: search,
    keyRisks: risks,
    recommendedActions: actions,
    sourcing: mode === "SOURCING" || mode === "HYBRID" ? sourcing : undefined,
    questionsToValidate: strings(root.questionsToValidate, 8),
    limitations: strings(root.limitations, 8),
  };
}
