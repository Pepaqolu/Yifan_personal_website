import { createClient } from "@/lib/supabase/server";

export type MarketUpdate = { id: string; title: string; summary: string; category: string; priority: string; source_url: string | null; source_name: string | null; notes: string | null; published_at: string | null; updated_at: string };
export type Competitor = { id: string; company_name: string; chinese_name: string | null; website: string | null; location: string | null; segment: string | null; description: string | null; products: string[]; pricing_notes: string | null; positioning: string | null; recent_activity: string | null; priority: string; external_client_notes: string | null; sources: string[]; updated_at: string };
export type Partner = { id: string; company_name: string; chinese_name: string | null; partner_type: string; location: string | null; website: string | null; contact_person: string | null; contact_role: string | null; wechat: string | null; email: string | null; phone: string | null; english_ability: string | null; interest_level: string | null; status: string; last_contact: string | null; notes: string | null; source: string | null; updated_at: string };
export type ResearchAttachment = {
  name: string;
  path: string;
  size: number;
  type: string;
};
export type ResearchReport = { id: string; title: string; category: string; summary: string | null; status: string; full_content: string | null; sources: string[]; attachments: ResearchAttachment[]; created_at: string; updated_at: string };
export type ClientRequest = { id: string; title: string; description: string; request_type: string; priority: string; status: string; updates: Array<{ message: string; created_at: string }>; created_at: string; updated_at: string };
export type KnowledgeItem = { id: string; title: string; category: string; content: string; tags: string[]; source: string | null; created_at: string; updated_at: string };
export type ActivityItem = { id: string; action: string; entity_type: string; created_at: string; metadata: Record<string, unknown> };

async function list<T>(table: string, organizationId: string, select = "*", order = "updated_at") {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).select(select).eq("organization_id", organizationId).order(order, { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export const getMarketUpdates = (organizationId: string) => list<MarketUpdate>("market_updates", organizationId, "id,title,summary,category,priority,source_url,source_name,notes,published_at,updated_at", "published_at");
export const getCompetitors = (organizationId: string) => list<Competitor>("competitors", organizationId, "id,company_name,chinese_name,website,location,segment,description,products,pricing_notes,positioning,recent_activity,priority,external_client_notes,sources,updated_at");
export const getPartners = (organizationId: string) => list<Partner>("partners", organizationId, "id,company_name,chinese_name,partner_type,location,website,contact_person,contact_role,wechat,email,phone,english_ability,interest_level,status,last_contact,notes,source,updated_at");
export const getResearchReports = (organizationId: string) => list<ResearchReport>("research_reports", organizationId, "id,title,category,summary,status,full_content,sources,attachments,created_at,updated_at");
export const getRequests = (organizationId: string) => list<ClientRequest>("requests", organizationId, "id,title,description,request_type,priority,status,updates,created_at,updated_at");
export const getKnowledgeItems = (organizationId: string) => list<KnowledgeItem>("knowledge_items", organizationId, "id,title,category,content,tags,source,created_at,updated_at");

export async function getActivity(organizationId: string, limit = 8) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("activity").select("id,action,entity_type,created_at,metadata").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as ActivityItem[];
}

export async function getOverview(organizationId: string) {
  const supabase = await createClient();
  const [market, competitors, competitorUpdates, identified, qualified, interested, researchCompleted, researchActive, requestsOpen, activity] = await Promise.all([
    supabase.from("market_updates").select("id", { count: "exact", head: true }).eq("organization_id", organizationId),
    supabase.from("competitors").select("id", { count: "exact", head: true }).eq("organization_id", organizationId),
    supabase.from("competitors").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).gte("updated_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    supabase.from("partners").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "IDENTIFIED"),
    supabase.from("partners").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "QUALIFIED"),
    supabase.from("partners").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "INTERESTED"),
    supabase.from("research_reports").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "COMPLETED"),
    supabase.from("research_reports").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "IN_PROGRESS"),
    supabase.from("requests").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).not("status", "in", "(COMPLETED,CANCELLED)"),
    getActivity(organizationId),
  ]);
  return { metrics: { market: market.count ?? 0, competitors: competitors.count ?? 0, competitorUpdates: competitorUpdates.count ?? 0, identified: identified.count ?? 0, qualified: qualified.count ?? 0, interested: interested.count ?? 0, researchCompleted: researchCompleted.count ?? 0, researchActive: researchActive.count ?? 0, requestsOpen: requestsOpen.count ?? 0 }, activity };
}

export async function getOrganizations() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("organizations").select("id,name,slug,created_at").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{ id: string; name: string; slug: string; created_at: string }>;
}

export async function getAdminOverview() {
  const supabase = await createClient();
  const [clients, requests, research, partners, activity] = await Promise.all([
    supabase.from("organizations").select("id", { count: "exact", head: true }),
    supabase.from("requests").select("id", { count: "exact", head: true }).not("status", "in", "(COMPLETED,CANCELLED)"),
    supabase.from("research_reports").select("id", { count: "exact", head: true }).eq("status", "IN_PROGRESS"),
    supabase.from("partners").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    supabase.from("activity").select("id,action,entity_type,created_at,metadata,organizations(name)").order("created_at", { ascending: false }).limit(12),
  ]);
  return { clients: clients.count ?? 0, requests: requests.count ?? 0, research: research.count ?? 0, partners: partners.count ?? 0, activity: activity.data ?? [] };
}

export async function getAdminRecords<T>(table: string, organizationId?: string, select = "*,organizations(name)") {
  const supabase = await createClient();
  let query = supabase.from(table).select(select).order("updated_at", { ascending: false });
  if (organizationId) query = query.eq("organization_id", organizationId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}
