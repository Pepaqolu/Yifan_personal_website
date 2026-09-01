import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AppRole = "CLIENT" | "ADMIN";

export type WorkspaceContext = {
  user: { id: string; email?: string };
  profile: { first_name: string | null; last_name: string | null; role: AppRole };
  organization: { id: string; name: string; slug: string } | null;
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
      .select("organizations(id,name,slug)")
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
  if (!context) redirect("/desk/login");
  if (!context.organization && context.profile.role !== "ADMIN") redirect("/desk/login?error=no-workspace");
  return context;
}

export async function requireAdmin() {
  const context = await getWorkspaceContext();
  if (!context) redirect("/desk/login");
  if (context.profile.role !== "ADMIN") redirect("/desk/app");
  return context;
}
