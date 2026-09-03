import type { PlannedQuery, ProductUnderstanding, QueryIntent } from "./types";

type IntentTemplate={intent:QueryIntent;suffixEn:string;suffixZh:string;sources:PlannedQuery["preferredSourceTypes"];rationale:string;priority:number};
const UNIVERSAL: IntentTemplate[] = [
  {intent:"DISCOVER_DISTRIBUTORS",suffixEn:"China distributors partners",suffixZh:"中国 经销商 代理商",sources:["COMMERCIAL","MARKET"],rationale:"Find potential routes to market and partnership candidates.",priority:1},
  {intent:"DISCOVER_PARTNERS",suffixEn:"China commercial partners",suffixZh:"中国 商业 合作伙伴",sources:["COMMERCIAL","MARKET"],rationale:"Identify complementary organizations with evidence of relevant activity.",priority:1},
  {intent:"DISCOVER_SUPPLIERS",suffixEn:"China suppliers manufacturers factory",suffixZh:"中国 供应商 制造商 工厂",sources:["COMMERCIAL","MARKET"],rationale:"Find supply and manufacturing candidates without treating marketplace listings as factory verification.",priority:1},
  {intent:"DISCOVER_CUSTOMERS",suffixEn:"China customers buyers procurement",suffixZh:"中国 客户 采购 买家",sources:["COMMERCIAL","AUTHORITATIVE"],rationale:"Identify organizations showing relevant demand or purchasing activity.",priority:1},
  {intent:"DISCOVER_COMPETITORS",suffixEn:"China competitors manufacturers brands",suffixZh:"中国 竞争对手 厂家 品牌",sources:["COMMERCIAL","MARKET"],rationale:"Map companies offering related products in China.",priority:2},
  {intent:"FIND_TENDERS",suffixEn:"China tender procurement award",suffixZh:"中国 采购 招标 中标",sources:["AUTHORITATIVE","COMMERCIAL"],rationale:"Find traceable procurement and demand signals.",priority:2},
  {intent:"FIND_COMPANY_ACTIVITY",suffixEn:"China company announcement product business",suffixZh:"中国 公司 公告 产品 业务",sources:["COMMERCIAL"],rationale:"Validate company activity using first-party material.",priority:3},
  {intent:"FIND_MARKET_SIGNALS",suffixEn:"China market demand application",suffixZh:"中国 市场 需求 应用",sources:["MARKET","COMMERCIAL"],rationale:"Find bounded market signals after higher-authority questions are covered.",priority:3},
  {intent:"FIND_PRICING",suffixEn:"China price quotation marketplace",suffixZh:"中国 价格 报价 市场",sources:["COMMERCIAL","MARKET"],rationale:"Collect directional pricing signals without treating listings as verified commercial terms.",priority:4},
];
const MEDTECH: IntentTemplate[]=[
  {intent:"FIND_REGULATORY_CLASSIFICATION",suffixEn:"China medical device classification",suffixZh:"医疗器械 分类界定",sources:["AUTHORITATIVE"],rationale:"Establish likely classification context from primary regulatory sources.",priority:1},
  {intent:"FIND_REGULATION",suffixEn:"NMPA registration guidance",suffixZh:"NMPA 注册 指导原则",sources:["AUTHORITATIVE"],rationale:"Identify current official market-access material.",priority:1},
  {intent:"FIND_STANDARDS",suffixEn:"China national industry standards technical requirements",suffixZh:"国家标准 行业标准 技术要求",sources:["AUTHORITATIVE"],rationale:"Find potentially applicable standards without assuming applicability.",priority:2},
];

export class ChinaQueryPlanner {
  plan(product: ProductUnderstanding): PlannedQuery[] {
    const zhTerms = [...(product.formalTermsZh || []), ...(product.keywordsZh || [])].filter(Boolean);
    const base = zhTerms[0] || product.productName;
    const geography = product.targetGeography || "China";
    const requested=new Set(product.objectives||[]);
    const intentMap:Record<string,QueryIntent[]>={distributors:["DISCOVER_DISTRIBUTORS"],customers:["DISCOVER_CUSTOMERS"],partners:["DISCOVER_PARTNERS","DISCOVER_DISTRIBUTORS"],suppliers:["DISCOVER_SUPPLIERS"],competitors:["DISCOVER_COMPETITORS"],tenders:["FIND_TENDERS"],pricing:["FIND_PRICING"],regulation:["FIND_REGULATION"]};
    let templates=[...(product.industry==="MEDTECH"?MEDTECH:[]),...UNIVERSAL];
    if(requested.size){const allowed=new Set([...requested].flatMap((goal)=>intentMap[goal]||[]));templates=templates.filter((item)=>allowed.has(item.intent)||item.intent==="FIND_COMPANY_ACTIVITY");}
    return templates.map((template) => ({
      intent: template.intent,
      query: `${base} ${zhTerms.length?template.suffixZh:template.suffixEn}${geography !== "China" ? ` ${geography}` : ""}`.trim(),
      queryLanguage: zhTerms.length ? "zh-CN" : "en",
      preferredSourceTypes: template.sources,
      geography,
      productTerms: zhTerms.length ? zhTerms.slice(0, 8) : [product.productName],
      rationale: template.rationale,
      priority: template.priority,
    }));
  }
}
