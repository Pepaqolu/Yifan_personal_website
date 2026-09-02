"use server";

import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSnapshotByToken, hashShareToken } from "@/lib/analysis/data";
import { getTrustedSiteUrl } from "@/lib/supabase/config";

export type TrialState = { message: string; success?: boolean; destination?: string };

function value(form: FormData, key: string, max = 500) { return String(form.get(key) ?? "").trim().slice(0, max); }
function slugPart(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,48) || "meridian-client"; }

export async function startTrial(_: TrialState, form: FormData): Promise<TrialState> {
  const token = value(form,"analysis",100);
  const email = value(form,"email",320).toLowerCase();
  const password = value(form,"password",200);
  const firstName = value(form,"first_name",120);
  const organizationNameInput = value(form,"organization_name",200);
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 10 || !firstName) return { message:"Enter your name, work email and a password of at least 10 characters." };
  const analysis = await getSnapshotByToken(token);
  if (!analysis || analysis.claimed_by) return { message:"This private snapshot is unavailable or has already been saved to an account." };

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password, options:{ data:{ first_name:firstName }, emailRedirectTo:`${getTrustedSiteUrl()}/auth/callback?next=/meridian/app` } });
  if (authError || !authData.user) return { message: authError?.message?.toLowerCase().includes("registered") ? "An account already uses this email. Sign in, then contact us to attach the snapshot." : "Your trial account could not be created. Please try again." };
  if (authData.user.identities?.length === 0) return { message:"An account already uses this email. Sign in, then contact us to attach the snapshot." };

  const admin = createAdminClient();
  const now = new Date();
  const ends = new Date(now.getTime()+7*24*60*60*1000);
  const hostName = analysis.company_website ? new URL(analysis.company_website).hostname.replace(/^www\./,"") : "";
  const organizationName = organizationNameInput || analysis.company_name || hostName || `${firstName}'s company`;
  const suffix = createHash("sha256").update(authData.user.id).digest("hex").slice(0,8);
  const { data: organization, error: orgError } = await admin.from("organizations").insert({ name:organizationName, slug:`${slugPart(organizationName)}-${suffix}`, onboarding_completed_at:now.toISOString(), trial_started_at:now.toISOString(), trial_ends_at:ends.toISOString(), source_analysis_id:analysis.id }).select("id").single();
  if (orgError || !organization) return { message:"Your account was created, but the workspace could not be prepared. Sign in and contact us for help." };

  const snapshot = analysis.analysis_payload;
  const knowledge = [
    { title:"Company overview", category:"Company", content:snapshot.companyUnderstanding.summary },
    { title:"Products and services for China", category:"Products", content:snapshot.companyUnderstanding.product },
    { title:"China objectives", category:"Commercial Strategy", content:(analysis.goals||[]).join(", ") },
    { title:"Target customers", category:"Target Customers", content:[...(analysis.target_audiences||[]),analysis.target_buyer_custom].filter(Boolean).join(", ") },
    { title:"Initial competitive landscape", category:"Competitors", content:snapshot.competitiveLandscape.join("\n") },
    { title:"Chinese search strategy", category:"Other Context", content:snapshot.chineseSearchStrategy.map((group)=>`${group.category}: ${group.terms.join(", ")}`).join("\n") },
    { title:"China risks to validate", category:"Important Decisions", content:snapshot.keyRisks.map((item)=>`${item.risk}: ${item.why}`).join("\n") },
    { title:"Recommended next actions", category:"Commercial Strategy", content:snapshot.recommendedActions.map((item,index)=>`${index+1}. ${item.action} — ${item.why}`).join("\n") },
  ].filter((item)=>item.content);

  const { error: memberError } = await admin.from("organization_members").insert({ organization_id:organization.id, user_id:authData.user.id, title:"Trial owner" });
  if (memberError) return { message:"Your account was created, but membership could not be completed. Contact us for help." };
  const [knowledgeResult, digestResult, claimResult, activityResult] = await Promise.all([
    admin.from("knowledge_items").insert(knowledge.map((item)=>({ ...item, organization_id:organization.id, tags:["analysis-seed","trial"], source:"Meridian free snapshot", created_by:authData.user!.id }))),
    admin.from("digest_subscriptions").insert({ organization_id:organization.id, enabled:true, next_digest_at:new Date(now.getTime()+7*24*60*60*1000).toISOString() }),
    admin.from("analysis_requests").update({ claimed_by:authData.user.id, organization_id:organization.id }).eq("share_token_hash",hashShareToken(token)).is("claimed_by",null),
    admin.from("activity").insert({ organization_id:organization.id, actor_id:authData.user.id, action:"7-day Meridian trial started from a China Opportunity Snapshot", entity_type:"analysis", entity_id:analysis.id }),
  ]);
  if (knowledgeResult.error || claimResult.error) return { message:"Your trial workspace was created, but the snapshot could not be fully attached. Sign in and contact us for help." };
  if (digestResult.error || activityResult.error) console.error("Trial retention setup was incomplete", { digest: digestResult.error?.message, activity: activityResult.error?.message });

  return { message: authData.session ? "Your Meridian workspace is ready." : "Your workspace is ready. Confirm your email, then sign in to continue.", success:true, destination:authData.session?"/meridian/app":"/meridian/login?trial=created" };
}
