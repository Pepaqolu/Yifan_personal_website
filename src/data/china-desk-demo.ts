export type MarketCategory = "Market" | "Competitor" | "Regulation" | "Partner" | "Customer" | "Pricing";
export type PartnerStatus = "Identified" | "Qualified" | "Contacted" | "Interested" | "Active";

export type MarketUpdate = { date: string; category: MarketCategory; headline: string; explanation: string; sourceType: string };
export type Competitor = { id: string; company: string; segment: string; latestActivity: string; priority: "High" | "Medium" | "Watch"; lastUpdated: string; overview: string; products: string[]; positioning: string; notes: string; sources: string[] };
export type Partner = { company: string; type: string; location: string; contact: string; status: PartnerStatus; notes: string };
export type ResearchItem = { title: string; date: string; status: "Complete" | "In progress" | "Planned"; description: string };
export type KnowledgeArea = { title: string; items: string[] };

export const chinaDeskDemo = {
  client: { name: "ACME MEDICAL", desk: "China Market Desk" },
  metrics: [
    { label: "MARKET PULSE", value: "3", detail: "meaningful developments this month" },
    { label: "COMPETITORS", value: "12", detail: "tracked · 2 new updates" },
    { label: "PARTNERS", value: "37", detail: "identified · 12 qualified · 4 conversations" },
    { label: "RESEARCH", value: "3", detail: "completed · 1 active" },
    { label: "REQUESTS", value: "2", detail: "open" },
  ],
  suggestedQueries: [
    "Who are our strongest Chinese competitors?",
    "Find distributors similar to this company.",
    "What changed in this market this month?",
    "How is our pricing positioned locally?",
    "What objections are Chinese buyers likely to have?",
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
    { company: "Example North Distributor", type: "Distributor", location: "Beijing", contact: "Not contacted", status: "Identified", notes: "Relevant hospital coverage; qualification pending." },
    { company: "Example East Healthcare", type: "Commercial partner", location: "Shanghai", contact: "Research complete", status: "Qualified", notes: "Strong segment fit and regional team." },
    { company: "Example South Medical", type: "Distributor", location: "Shenzhen", contact: "Introductory email", status: "Contacted", notes: "Awaiting response from commercial lead." },
    { company: "Example Clinical Group", type: "Customer network", location: "Guangzhou", contact: "Initial call", status: "Interested", notes: "Requested localized product information." },
    { company: "Example Service Partner", type: "Service partner", location: "Hangzhou", contact: "Working session", status: "Active", notes: "Demo active relationship for workspace visualization." },
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
