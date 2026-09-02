import type { PlannedQuery, ProductUnderstanding, QueryIntent } from "./types";

const INTENTS: Array<{ intent: QueryIntent; suffix: string; sources: PlannedQuery["preferredSourceTypes"]; rationale: string; priority: number }> = [
  { intent: "FIND_REGULATORY_CLASSIFICATION", suffix: "医疗器械 分类界定", sources: ["AUTHORITATIVE"], rationale: "Establish likely classification context from primary regulatory sources.", priority: 1 },
  { intent: "FIND_REGULATION", suffix: "NMPA 注册 指导原则", sources: ["AUTHORITATIVE"], rationale: "Identify current official market-access material.", priority: 1 },
  { intent: "FIND_STANDARDS", suffix: "国家标准 行业标准 技术要求", sources: ["AUTHORITATIVE"], rationale: "Find potentially applicable standards without assuming applicability.", priority: 2 },
  { intent: "DISCOVER_DISTRIBUTORS", suffix: "经销商 代理商 医疗器械", sources: ["COMMERCIAL", "MARKET"], rationale: "Discover distributor candidates using China-specific commercial language.", priority: 1 },
  { intent: "FIND_TENDERS", suffix: "采购 招标 中标 医院", sources: ["COMMERCIAL", "AUTHORITATIVE"], rationale: "Look for procurement evidence and recent commercial activity.", priority: 2 },
  { intent: "DISCOVER_COMPETITORS", suffix: "厂家 品牌 产品", sources: ["COMMERCIAL", "MARKET"], rationale: "Identify companies offering adjacent products in China.", priority: 3 },
  { intent: "FIND_COMPANY_ACTIVITY", suffix: "公司 公告 产品 业务", sources: ["COMMERCIAL"], rationale: "Validate product portfolios and company activity using first-party sources.", priority: 3 },
  { intent: "FIND_MARKET_SIGNALS", suffix: "市场 临床 应用", sources: ["MARKET", "COMMERCIAL"], rationale: "Find bounded market signals after primary questions are covered.", priority: 4 },
];

export class ChinaQueryPlanner {
  plan(product: ProductUnderstanding): PlannedQuery[] {
    const zhTerms = [...(product.formalTermsZh || []), ...(product.keywordsZh || [])].filter(Boolean);
    const base = zhTerms[0] || product.productName;
    const geography = product.targetGeography || "China";
    return INTENTS.map((template) => ({
      intent: template.intent,
      query: `${base} ${template.suffix}${geography !== "China" ? ` ${geography}` : ""}`.trim(),
      queryLanguage: zhTerms.length ? "zh-CN" : "en",
      preferredSourceTypes: template.sources,
      geography,
      productTerms: zhTerms.length ? zhTerms.slice(0, 8) : [product.productName],
      rationale: template.rationale,
      priority: template.priority,
    }));
  }
}

