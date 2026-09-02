export type EvidenceKind =
  | "CLIENT_INFORMATION"
  | "RESEARCH"
  | "MARKET_UPDATE"
  | "COMPETITOR"
  | "PARTNER"
  | "REQUEST"
  | "ACTIVITY"
  | "ORGANIZATION"
  | "PRODUCT_PROFILE"
  | "REGULATORY_EVIDENCE"
  | "REGULATORY_MATCH"
  | "OPPORTUNITY_ASSESSMENT";

export type EvidenceItem = {
  key: string;
  kind: EvidenceKind;
  id: string;
  title: string;
  content: string;
  date?: string;
  sourceName?: string;
  sourceUrl?: string;
  score: number;
};

export type SourceReference = Pick<EvidenceItem, "key" | "kind" | "id" | "title" | "sourceName" | "sourceUrl">;

export type AskChinaAnswer = {
  answer: string;
  whatWeKnow: string[];
  assessment: string[];
  missingInformation: string[];
  sourceKeys: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  requiresLocalExecution: boolean;
  localExecutionReason: string;
  suggestedRequestTitle: string;
  suggestedRequestType: string;
};

export type ResearchDraft = {
  title: string;
  summary: string;
  keyFindings: string[];
  implications: string[];
  companiesMentioned: string[];
  potentialCompetitors: string[];
  potentialPartners: string[];
  tags: string[];
  followUpQuestions: string[];
};

export type MarketPulseDraft = {
  headline: string;
  summary: string;
  category: string;
  whyItMatters: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  recommendedAction: string;
};

export type CompetitorAssessment = {
  positioning: string;
  strengths: string[];
  weaknesses: string[];
  recentActivity: string;
  potentialThreat: string;
  questionsToInvestigate: string[];
  evidenceLimitations: string[];
};

export type PartnerAssessment = {
  fit: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  rationale: string;
  concerns: string[];
  questionsToVerify: string[];
  recommendedNextAction: string;
  evidenceLimitations: string[];
};

export type OpportunitySnapshotInput = {
  companyWebsite: string;
  companyName: string;
  productDescription: string;
  industry: string;
  goals: string[];
  targetBuyers: string[];
  targetBuyerCustom: string;
  chinaStatus: string;
  additionalContext: string;
  retrievedPage?: { url: string; title: string; text: string };
  retrievalLimitation?: string;
};

export type OpportunitySnapshot = {
  mode: "MARKET_ENTRY" | "SOURCING" | "HYBRID";
  companyUnderstanding: {
    company: string;
    product: string;
    summary: string;
    likelyBuyer: string;
  };
  verifiedInformation: string[];
  opportunityScore: {
    total: number;
    label: string;
    factors: Array<{ label: string; score: number; rationale: string }>;
  };
  bestFitBuyerTypes: Array<{ type: string; why: string }>;
  competitiveLandscape: string[];
  chineseSearchStrategy: Array<{ category: string; terms: string[] }>;
  keyRisks: Array<{ risk: string; why: string }>;
  recommendedActions: Array<{ action: string; why: string }>;
  sourcing?: {
    likelyRegions: string[];
    supplierArchetypes: string[];
    moqConsiderations: string[];
    dueDiligenceChecklist: string[];
  };
  questionsToValidate: string[];
  limitations: string[];
};

export type AIResult<T> = {
  value: T;
  model: string;
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
};

export interface AIProvider {
  generateAnswer(input: {
    question: string;
    evidence: EvidenceItem[];
    history: Array<{ role: "USER" | "ASSISTANT"; content: string }>;
  }): Promise<AIResult<AskChinaAnswer>>;
  summarizeResearch(input: { material: string; clientContext: string }): Promise<AIResult<ResearchDraft>>;
  generateMarketPulse(input: { material: string; clientContext: string }): Promise<AIResult<MarketPulseDraft>>;
  analyzeCompetitor(input: { facts: string; clientContext: string }): Promise<AIResult<CompetitorAssessment>>;
  analyzePartner(input: { facts: string; clientContext: string }): Promise<AIResult<PartnerAssessment>>;
  generateOpportunitySnapshot(input: OpportunitySnapshotInput): Promise<AIResult<OpportunitySnapshot>>;
}
