export const clientNavigation = [
  ["Overview", "/meridian/app", ""],
  ["Opportunity Map", "/meridian/app/partners", "DISCOVER"],
  ["Competitors", "/meridian/app/competitors", ""],
  ["Partners", "/meridian/app/partners?view=companies", ""],
  ["Signals", "/meridian/app/market", ""],
  ["Pipeline", "/meridian/app/partners?view=pipeline", "WORK"],
  ["Research", "/meridian/app/research", ""],
  ["Requests", "/meridian/app/requests", ""],
  ["Knowledge", "/meridian/app/knowledge", "CONTEXT"],
  ["Ask Meridian", "/meridian/app/ask", "COMMAND"],
] as const;

export const adminNavigation = [
  ["Overview", "/admin", ""],
  ["Intelligence", "/admin/intelligence", "CONTROL"],
  ["Clients", "/admin/clients", ""],
  ["Requests", "/admin/requests", "WORK"],
  ["Research", "/admin/research", ""],
  ["Partners", "/admin/partners", "INTELLIGENCE"],
  ["Competitors", "/admin/competitors", ""],
  ["Market", "/admin/market", ""],
] as const;

export const partnerStatuses = ["IDENTIFIED", "QUALIFIED", "CONTACTED", "REPLIED", "INTERESTED", "NEGOTIATING", "ACTIVE", "NOT_A_FIT"] as const;
export const requestStatuses = ["SUBMITTED", "REVIEWING", "IN_PROGRESS", "NEEDS_INFORMATION", "COMPLETED", "CANCELLED"] as const;
export const researchStatuses = ["REQUESTED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"] as const;
export const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const requestTypes = ["Research a company", "Find partners", "Find suppliers", "Check a competitor", "Validate an assumption", "Market question", "Contact someone", "Other"] as const;
export const knowledgeCategories = ["Company", "Products", "Target Customers", "Target Markets", "Competitors", "Existing Partners", "Existing Suppliers", "Pricing", "Commercial Strategy", "Important Decisions", "Previous Research", "Other Context"] as const;

export function humanize(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}
