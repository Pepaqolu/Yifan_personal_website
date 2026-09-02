import type { ProductProfileInput, ProductUnderstanding } from "./types";

const clean = (value = "", max = 4000) => value.trim().replace(/\s+/g, " ").slice(0, max);
const unique = (values: string[] = []) => [...new Set(values.map((value) => clean(value, 120)).filter(Boolean))].slice(0, 30);

/**
 * Produces provider-independent product memory. It intentionally does not
 * invent Chinese terminology or regulatory conclusions. AI enrichment can be
 * layered on top and must retain its generated status until confirmed.
 */
export class ProductIntelligenceService {
  understand(input: ProductProfileInput): ProductUnderstanding {
    const productName = clean(input.productName, 240);
    if (!productName) throw new Error("A product name is required.");
    const context = `${productName} ${input.productDescription || ""} ${input.clinicalUse || ""}`.toLowerCase();
    const subindustry = context.match(/eeg|electroencephal|neurophys/) ? "Neurophysiology / diagnostic monitoring"
      : context.match(/rehab|rehabilitation|physiotherapy/) ? "Rehabilitation technology"
      : "Medical device";
    return {
      companyName: clean(input.companyName, 240),
      companyUrl: clean(input.companyUrl, 500),
      productName,
      productDescription: clean(input.productDescription),
      intendedUse: clean(input.intendedUse),
      clinicalUse: clean(input.clinicalUse),
      targetCustomer: clean(input.targetCustomer),
      targetDepartment: clean(input.targetDepartment),
      targetMarketSegment: clean(input.targetMarketSegment),
      businessGoal: clean(input.businessGoal),
      targetGeography: clean(input.targetGeography || "China", 160),
      chinaStatus: clean(input.chinaStatus, 500),
      keywordsEn: unique(input.keywordsEn),
      keywordsZh: unique(input.keywordsZh),
      formalTermsZh: unique(input.formalTermsZh),
      procurementTermsZh: unique(input.procurementTermsZh),
      distributorTermsZh: unique(input.distributorTermsZh),
      regulatoryTermsZh: unique(input.regulatoryTermsZh),
      industry: "MEDTECH",
      subindustry,
      relatedCategories: [subindustry],
      regulatoryQuestions: [
        "What is the exact intended use in the Chinese market?",
        "Does the product include diagnostic, automated interpretation, software, wireless or cloud functions?",
        "Which existing certifications, testing reports and clinical evidence are available?",
      ],
      terminologyStatus: input.keywordsZh?.length ? "USER_CONFIRMED" : "AI_GENERATED",
    };
  }
}

