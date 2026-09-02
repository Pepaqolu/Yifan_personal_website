export type EvidenceKind =
  | "CLIENT_INFORMATION"
  | "RESEARCH"
  | "MARKET_UPDATE"
  | "COMPETITOR"
  | "PARTNER"
  | "REQUEST"
  | "ACTIVITY"
  | "ORGANIZATION";

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
}
