import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { productConfig } from "@/config/productConfig";

export type AppRole = "CLIENT" | "ADMIN";

export type WorkspaceContext = {
  user: { id: string; email?: string };
  profile: { first_name: string | null; last_name: string | null; role: AppRole };
  organization: {
    id: string;
    name: string;
    slug: string;
    ai_response_mode: "DIRECT" | "REVIEW";
    onboarding_completed_at: string | null;
    onboarding_skipped_at: string | null;
    trial_started_at: string | null;
    trial_ends_at: string | null;
    source_analysis_id: string | null;
  } | null;
};

export async function getWorkspaceContext(): Promise<WorkspaceContext | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) return null;

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("first_name,last_name,role").eq("id", userId).single(),
    supabase
      .from("organization_members")
      .select("organizations(id,name,slug,ai_response_mode,onboarding_completed_at,onboarding_skipped_at,trial_started_at,trial_ends_at,source_analysis_id)")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle(),
  ]);

  const organizationValue = membership?.organizations;
  const organization = Array.isArray(organizationValue)
    ? organizationValue[0] ?? null
    : organizationValue ?? null;

  return {
    user: { id: userId, email: typeof claimsData.claims.email === "string" ? claimsData.claims.email : undefined },
    profile: {
      first_name: profile?.first_name ?? null,
      last_name: profile?.last_name ?? null,
      role: profile?.role === "ADMIN" ? "ADMIN" : "CLIENT",
    },
    organization,
  };
}

export async function requireWorkspace() {
  const context = await getWorkspaceContext();
  if (!context) redirect(productConfig.routes.login);
  if (!context.organization && context.profile.role !== "ADMIN") redirect(`${productConfig.routes.login}?error=no-workspace`);
  return context;
}

export async function requireAdmin() {
  const context = await getWorkspaceContext();
  if (!context) redirect(productConfig.routes.login);
  if (context.profile.role !== "ADMIN") redirect(productConfig.routes.app);
  return context;
}
