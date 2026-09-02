import { productConfig } from "@/config/productConfig";

export type MarketCategory = "Market" | "Competitor" | "Regulation" | "Partner" | "Customer" | "Pricing";
export type PartnerStatus = "Discovered" | "Qualified" | "Contacted" | "Replied" | "Interested" | "Negotiating" | "Active" | "Not a fit";

export type MarketUpdate = { date: string; category: MarketCategory; headline: string; explanation: string; sourceType: string };
export type Competitor = { id: string; company: string; segment: string; latestActivity: string; priority: "High" | "Medium" | "Watch"; lastUpdated: string; overview: string; products: string[]; positioning: string; notes: string; sources: string[] };
export type Partner = { company: string; chineseName: string; website: string; type: string; location: string; contact: string; status: PartnerStatus; notes: string; products: string; brands: string; segment: string; score: number; why: string; concerns: string; nextAction: string };
export type ResearchItem = { title: string; date: string; status: "Complete" | "In progress" | "Planned"; description: string };
export type KnowledgeArea = { title: string; items: string[] };

export const chinaDeskDemo = {
  client: { name: "ACME MEDICAL", desk: "China Opportunity Workspace" },
  metrics: [
    { label: "OPPORTUNITY SCORE", value: "87", detail: `${productConfig.shortName} assessment · explainable factors` },
    { label: "MARKET SIGNALS", value: "3", detail: "commercial developments to review" },
    { label: "TOP COMPETITORS", value: "12", detail: "tracked · 2 meaningful updates" },
    { label: "OPPORTUNITIES", value: "37", detail: "customers, distributors and partners" },
    { label: "HIGH FIT", value: "08", detail: "priority companies to investigate" },
  ],
  suggestedQueries: [
    "Who are our strongest potential distributors?",
    "Which companies should we contact first?",
    "What changed in our market this month?",
    "What should our first China move be?",
  ],
  marketUpdates: [
    { date: "12 SEP", category: "Competitor", headline: "A domestic competitor introduced a new mid-market product tier", explanation: "The launch may change pricing expectations in the segment. Positioning and channel response require monitoring.", sourceType: "Company announcement · Chinese language" },
    { date: "08 SEP", category: "Partner", headline: "Two regional distributors expanded their hospital coverage", explanation: "Both now cover additional priority provinces and may be relevant to the current partner search.", sourceType: "Trade media · Distributor websites" },
    { date: "02 SEP", category: "Regulation", headline: "A consultation draft may affect product documentation", explanation: "No immediate action is required. The final wording and implementation timeline remain unconfirmed.", sourceType: "Regulatory notice · Chinese language" },
  ] satisfies MarketUpdate[],
  competitors: [
    { id: "demo-a", company: "Demo Medical A", segment: "Core devices", latestActivity: "New mid-market launch", priority: "High", lastUpdated: "12 Sep", overview: "Illustrative domestic manufacturer used only for this product demo.", products: ["Core system", "Compact system"], positioning: "Local engineering, responsive service, mid-market pricing.", notes: "Monitor channel response and public tender references.", sources: ["Demo company website", "Demo trade-media scan"] },
    { id: "demo-b", company: "Demo Diagnostics B", segment: "Diagnostics", latestActivity: "Distributor campaign", priority: "Medium", lastUpdated: "8 Sep", overview: "Illustrative competitor record. Not a real client or monitoring target.", products: ["Diagnostic platform"], positioning: "Clinical workflow and distributor reach.", notes: "Review messaging in priority provinces.", sources: ["Demo distributor pages"] },
    { id: "demo-c", company: "Demo Device C", segment: "Value tier", latestActivity: "Pricing unchanged", priority: "Watch", lastUpdated: "2 Sep", overview: "Illustrative company used to demonstrate a low-priority watchlist item.", products: ["Value device"], positioning: "Price-led alternative.", notes: "Keep on watchlist; no action currently required.", sources: ["Demo marketplace scan"] },
  ] satisfies Competitor[],
  partners: [
    { company: "Example East Healthcare", chineseName: "示例东方医疗", website: "example-east.invalid", type: "Distributor", location: "Shanghai", contact: "Commercial director identified", status: "Qualified", notes: "Strong segment fit and regional hospital team.", products: "Specialist devices and clinical systems", brands: "Imported and domestic portfolio", segment: "Specialist hospitals", score: 91, why: "Hospital overlap, imported brand portfolio and current commercial activity.", concerns: "Decision-maker identity still requires verification.", nextAction: "Verify portfolio and prepare a focused introduction." },
    { company: "Example Clinical Group", chineseName: "示例临床集团", website: "example-clinical.invalid", type: "Customer network", location: "Guangzhou", contact: "Procurement lead unverified", status: "Replied", notes: "Requested localized product information.", products: "Specialty clinical services", brands: "Not applicable", segment: "Clinical customers", score: 87, why: "Strong specialty fit and active procurement signals.", concerns: "Procurement timeline is not yet confirmed.", nextAction: "Confirm buying cycle and relevant department." },
    { company: "Example North Medical", chineseName: "示例北方医疗", website: "example-north.invalid", type: "Commercial partner", location: "Beijing", contact: "Not contacted", status: "Discovered", notes: "Relevant hospital coverage; qualification pending.", products: "Medical devices and service", brands: "International portfolio", segment: "Northern China", score: 82, why: "Regional coverage and signs of international readiness.", concerns: "Product overlap requires closer review.", nextAction: "Review represented brands and regional tender history." },
    { company: "Example South Medical", chineseName: "示例南方医疗", website: "example-south.invalid", type: "Distributor", location: "Shenzhen", contact: "Introductory email sent", status: "Contacted", notes: "Awaiting response from commercial lead.", products: "Hospital equipment", brands: "Mixed portfolio", segment: "South China", score: 78, why: "Priority geography and visible distributor activity.", concerns: "Limited evidence of specialist segment coverage.", nextAction: "Follow up with a segment-specific question." },
    { company: "Example Service Partner", chineseName: "示例服务伙伴", website: "example-service.invalid", type: "Service partner", location: "Hangzhou", contact: "Working session", status: "Active", notes: "Demo active relationship for workspace visualization.", products: "Installation and service", brands: "Multi-brand", segment: "After-sales service", score: 75, why: "Relevant service coverage and responsive operating team.", concerns: "Commercial capacity is still being assessed.", nextAction: "Document service-level expectations." },
  ] satisfies Partner[],
  research: [
    { title: "China market overview", date: "10 Sep", status: "Complete", description: "Market structure, priority segments and major commercial questions." },
    { title: "Competitor landscape", date: "6 Sep", status: "Complete", description: "Positioning and activity across a focused competitor set." },
    { title: "Distributor shortlist", date: "1 Sep", status: "In progress", description: "Qualification of potential regional distribution partners." },
    { title: "Pricing study", date: "Planned", status: "Planned", description: "Local pricing architecture and channel margin questions." },
    { title: "Supplier review", date: "Planned", status: "Planned", description: "A structured comparison of relevant manufacturing options." },
    { title: "Regulatory question", date: "9 Sep", status: "Complete", description: "Focused Chinese-language research on a product documentation question." },
  ] satisfies ResearchItem[],
  requestTypes: ["Research a company", "Find partners", "Find suppliers", "Validate an assumption", "Check a competitor", "Contact someone", "Other"],
  knowledge: [
    { title: "Company", items: ["International medical technology company", "China market under evaluation"] },
    { title: "Products", items: ["Core platform", "Compact platform", "Service offering"] },
    { title: "Target Customers", items: ["Tier-two hospitals", "Specialist clinical groups"] },
    { title: "Competitors", items: ["12 monitored records", "3 priority profiles"] },
    { title: "Partners", items: ["37 identified", "12 qualified"] },
    { title: "Suppliers", items: ["Category map in development"] },
    { title: "Previous Research", items: ["Market overview", "Competitor landscape", "Distributor shortlist"] },
    { title: "Important Decisions", items: ["Prioritize two provinces", "Validate mid-market positioning"] },
  ] satisfies KnowledgeArea[],
} as const;
