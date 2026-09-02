export type ConfirmationStatus = "AI_GENERATED" | "USER_CONFIRMED" | "ADMIN_CONFIRMED";
export type QueryIntent =
  | "FIND_REGULATION"
  | "FIND_REGULATORY_CLASSIFICATION"
  | "FIND_STANDARDS"
  | "DISCOVER_COMPETITORS"
  | "DISCOVER_DISTRIBUTORS"
  | "FIND_TENDERS"
  | "FIND_COMPANY_ACTIVITY"
  | "FIND_MARKET_SIGNALS";

export type ProductProfileInput = {
  companyName?: string;
  companyUrl?: string;
  productName: string;
  productDescription?: string;
  intendedUse?: string;
  clinicalUse?: string;
  targetCustomer?: string;
  targetDepartment?: string;
  targetMarketSegment?: string;
  businessGoal?: string;
  targetGeography?: string;
  chinaStatus?: string;
  keywordsEn?: string[];
  keywordsZh?: string[];
  formalTermsZh?: string[];
  procurementTermsZh?: string[];
  distributorTermsZh?: string[];
  regulatoryTermsZh?: string[];
};

export type ProductUnderstanding = ProductProfileInput & {
  industry: "MEDTECH";
  subindustry: string;
  relatedCategories: string[];
  regulatoryQuestions: string[];
  terminologyStatus: ConfirmationStatus;
};

export type PlannedQuery = {
  intent: QueryIntent;
  query: string;
  queryLanguage: "zh-CN" | "en";
  preferredSourceTypes: Array<"AUTHORITATIVE" | "COMMERCIAL" | "MARKET">;
  geography: string;
  productTerms: string[];
  rationale: string;
  priority: number;
};

export type SourceClassification = {
  sourceType: "AUTHORITATIVE" | "COMMERCIAL" | "MARKET";
  authorityLevel: "PRIMARY" | "HIGH" | "MEDIUM" | "LOW";
  regulatoryAuthority: boolean;
  commercialSignalStrength: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  status: "ACTIVE" | "LIMITED" | "PLANNED" | "MANUAL" | "DISABLED";
};

