export const intelligenceConfig = {
  resultThreshold: 60,
  topResultsCount: 10,
  searchQualityWeights: {
    intentRelevance: 25,
    sourceCredibility: 20,
    specificity: 15,
    actionability: 15,
    evidenceTraceability: 10,
    freshness: 10,
    differentiation: 5,
  },
  opportunityWeights: {
    productMarketFit: 20,
    customerChannelFit: 15,
    partnershipOpenness: 10,
    incumbentFriction: 10,
    legitimacy: 15,
    commercialActivity: 10,
    contactability: 10,
    evidenceCoverage: 10,
  },
  sourceCredibilityDefaults: {
    REGULATOR_PRIMARY: 95,
    GOVERNMENT_PROCUREMENT: 90,
    OFFICIAL_REGISTRY: 88,
    OFFICIAL_COMPANY: 78,
    INDUSTRY_MEDIA: 72,
    MARKETPLACE: 55,
    OFFICIAL_SOCIAL: 52,
    USER_GENERATED: 35,
    UNKNOWN_DIRECTORY: 20,
  },
  regulatoryThresholds: { likely: 75, possible: 60 },
  searchBehavior: { priority: 90, strong: 80, useful: 70, qualifying: 60, internal: 40 },
} as const;

export type SourceCredibilityKind = keyof typeof intelligenceConfig.sourceCredibilityDefaults;
