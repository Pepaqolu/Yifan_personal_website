import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { paymentConfiguration } from "./config";
import { chargeSubscription } from "./paddle";
import { autoRefillPacks, autoRefillTriggers } from "@/config/paymentCatalog";

export type AutoRefillReason = "AFTER_RESEARCH" | "BEFORE_RESEARCH" | "USER_RETRY";

export async function attemptAutoRefill(organizationId: string, reason: AutoRefillReason, requiredTokens = 0) {
  const admin = createAdminClient();
  const config = paymentConfiguration();
  if (!config.configured) return { status: "UNAVAILABLE" as const };
  const [{ data: settings }, { data: account }, { data: lots }] = await Promise.all([
    admin.from("auto_refill_settings").select("*").eq("organization_id", organizationId).maybeSingle(),
    admin.from("billing_accounts").select("*").eq("organization_id", organizationId).maybeSingle(),
    admin.from("token_lots").select("available_tokens,kind,expires_at").eq("organization_id", organizationId),
  ]);
  if (!settings?.enabled || settings.status !== "ACTIVE") return { status: "DISABLED" as const };
  if (!account || account.payment_profile_status !== "ACTIVE" || !account.paddle_subscription_id) {
    await admin.from("auto_refill_settings").update({ status: "PAYMENT_PROFILE_INACTIVE" }).eq("organization_id", organizationId);
    return { status: "PROFILE_INACTIVE" as const };
  }
  if (!autoRefillTriggers.includes(settings.trigger_tokens) || !autoRefillPacks.includes(settings.refill_tokens)) return { status: "INVALID_SETTINGS" as const };
  const now = Date.now();
  const balance = (lots || []).filter((item) => item.kind !== "PROMOTIONAL" || !item.expires_at || new Date(item.expires_at).getTime() > now).reduce((sum, item) => sum + item.available_tokens, 0);
  if (balance >= settings.trigger_tokens && balance >= requiredTokens) return { status: "NOT_NEEDED" as const };

  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const { data: month } = await admin.from("payment_transactions").select("token_pack").eq("organization_id", organizationId).eq("purchase_type", "AUTO_REFILL").eq("status", "COMPLETED").gte("completed_at", start.toISOString());
  const spent = (month || []).reduce((sum, item) => sum + Number(item.token_pack || 0), 0);
  const key = `${reason}:${start.toISOString().slice(0, 7)}:${settings.refill_tokens}:${Math.floor(Date.now() / 300_000)}`;
  if (spent + settings.refill_tokens > settings.monthly_cap_usd) {
    await admin.from("auto_refill_settings").update({ status: "CAP_REACHED", last_attempt_at: new Date().toISOString() }).eq("organization_id", organizationId);
    await admin.from("auto_refill_attempts").insert({ organization_id: organizationId, trigger_reason: reason, balance_before: balance, threshold_tokens: settings.trigger_tokens, refill_tokens: settings.refill_tokens, monthly_cap_usd: settings.monthly_cap_usd, month_spend_before_usd: spent, idempotency_key: key, status: "CAP_BLOCKED" });
    return { status: "CAP_REACHED" as const };
  }

  const attempt = await admin.from("auto_refill_attempts").insert({ organization_id: organizationId, trigger_reason: reason, balance_before: balance, threshold_tokens: settings.trigger_tokens, refill_tokens: settings.refill_tokens, monthly_cap_usd: settings.monthly_cap_usd, month_spend_before_usd: spent, idempotency_key: key, status: "CREATED" }).select("id").single();
  if (attempt.error) {
    if (attempt.error.code === "23505") return { status: "ALREADY_PENDING" as const };
    throw attempt.error;
  }
  try {
    await chargeSubscription(account.paddle_subscription_id, config.packIds[settings.refill_tokens]!);
    await admin.from("auto_refill_attempts").update({ status: "PENDING" }).eq("id", attempt.data.id);
    await admin.from("auto_refill_settings").update({ last_attempt_at: new Date().toISOString() }).eq("organization_id", organizationId);
    return { status: "PENDING" as const };
  } catch (error) {
    await admin.from("auto_refill_attempts").update({ status: "FAILED", failure: error instanceof Error ? error.message : "Payment failed", completed_at: new Date().toISOString() }).eq("id", attempt.data.id);
    await admin.from("auto_refill_settings").update({ status: "PAYMENT_ATTENTION_REQUIRED", last_attempt_at: new Date().toISOString() }).eq("organization_id", organizationId);
    return { status: "FAILED" as const };
  }
}
