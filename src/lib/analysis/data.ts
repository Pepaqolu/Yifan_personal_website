import "server-only";

import { createHash } from "node:crypto";
import { validateOpportunitySnapshot } from "@/lib/analysis/snapshot";
import { createAdminClient } from "@/lib/supabase/admin";

export function hashShareToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function getSnapshotByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("analysis_requests").select("id,company_website,company_name,goals,product_description,industry,target_audiences,target_buyer_custom,china_status,additional_context,analysis_payload,source_snapshot,generated_at,share_token_expires_at,claimed_by,organization_id").eq("share_token_hash", hashShareToken(token)).eq("status", "READY").maybeSingle();
  if (error || !data || !data.share_token_expires_at || new Date(data.share_token_expires_at).getTime() <= Date.now()) return null;
  try {
    return { ...data, analysis_payload: validateOpportunitySnapshot(data.analysis_payload) };
  } catch {
    return null;
  }
}
