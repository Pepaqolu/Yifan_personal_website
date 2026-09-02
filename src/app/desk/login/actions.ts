"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTrustedSiteUrl, isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthState = { message: string; success?: boolean };

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function destinationForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role === "ADMIN") return "/admin";
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organizations(onboarding_completed_at,onboarding_skipped_at)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  const organization = Array.isArray(membership?.organizations)
    ? membership.organizations[0]
    : membership?.organizations;
  return organization?.onboarding_completed_at || organization?.onboarding_skipped_at
    ? "/desk/app"
    : "/desk/app/onboarding";
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { message: "China Desk authentication has not been configured yet." };
  const email = value(formData, "email");
  const password = value(formData, "password");
  if (!email || !password) return { message: "Enter your email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { message: "We could not sign you in. Check your invitation and credentials." };
  redirect(await destinationForUser(supabase, data.user.id));
}

export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { message: "China Desk authentication has not been configured yet." };
  const email = value(formData, "email");
  if (!email) return { message: "Enter the email associated with your invitation." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getTrustedSiteUrl()}/auth/callback?next=/desk/login/update-password`,
  });
  if (error) return { message: "We could not send a reset email. Please contact Yifan." };
  return { message: "If an invited account exists, a reset link is on its way.", success: true };
}

export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = value(formData, "password");
  if (password.length < 10) return { message: "Use at least 10 characters." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) return { message: "The password could not be updated. Request a new reset link." };
  redirect(await destinationForUser(supabase, data.user.id));
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/desk/login");
}
