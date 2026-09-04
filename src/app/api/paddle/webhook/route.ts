import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paymentConfiguration, packForPrice } from "@/lib/payments/config";
import { verifyPaddleSignature } from "@/lib/payments/signature";

/* Paddle payloads are externally versioned; all value-bearing fields are validated before use. */
/* eslint-disable @typescript-eslint/no-explicit-any */
type PaddleEvent = { event_id: string; event_type: string; occurred_at?: string; data: Record<string, any> };
const minor = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("paddle-signature") || "";
  const config = paymentConfiguration();
  if (!config.enabled || !config.webhookSecret) return NextResponse.json({ error: "Webhook unavailable." }, { status: 503 });
  if (!verifyPaddleSignature(raw, signature, config.webhookSecret)) return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  let event: PaddleEvent;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid payload." }, { status: 400 }); }
  if (!event.event_id || !event.event_type) return NextResponse.json({ error: "Invalid event." }, { status: 400 });

  const admin = createAdminClient();
  const data = event.data || {};
  const custom = data.custom_data || {};
  if (custom.meridian_environment && custom.meridian_environment !== config.environment) return NextResponse.json({ error: "Environment mismatch." }, { status: 409 });
  const base = { event_id: event.event_id, event_type: event.event_type, occurred_at: event.occurred_at || null, environment: config.environment, processing_status: "PROCESSING", related_customer_id: data.customer_id || null, related_transaction_id: event.event_type.startsWith("transaction.") ? data.id : data.transaction_id || null, related_subscription_id: event.event_type.startsWith("subscription.") ? data.id : data.subscription_id || null, metadata: { notification_id: data.notification_id || null } };
  let logId: string;
  const inserted = await admin.from("paddle_webhook_events").insert(base).select("id").single();
  if (inserted.error) {
    if (inserted.error.code !== "23505") return NextResponse.json({ error: "Event could not be recorded." }, { status: 500 });
    const existing = await admin.from("paddle_webhook_events").select("id,processing_status").eq("event_id", event.event_id).eq("environment", config.environment).single();
    if (existing.error) return NextResponse.json({ error: "Event state unavailable." }, { status: 500 });
    if (existing.data.processing_status !== "FAILED") return NextResponse.json({ ok: true, duplicate: true });
    const claimed = await admin.from("paddle_webhook_events").update({ processing_status: "PROCESSING", error: null }).eq("id", existing.data.id).eq("processing_status", "FAILED").select("id").maybeSingle();
    if (claimed.error || !claimed.data) return NextResponse.json({ ok: true, duplicate: true });
    logId = claimed.data.id;
  } else logId = inserted.data.id;

  try {
    await processEvent(event, config.environment);
    await admin.from("paddle_webhook_events").update({ processing_status: "PROCESSED", processed_at: new Date().toISOString(), error: null }).eq("id", logId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await admin.from("paddle_webhook_events").update({ processing_status: "FAILED", error: String(error instanceof Error ? error.message : error).slice(0, 1000) }).eq("id", logId);
    return NextResponse.json({ error: "Verified event processing failed." }, { status: 500 });
  }
}

async function processEvent(event: PaddleEvent, environment: string) {
  const admin = createAdminClient();
  const data = event.data || {};
  const custom = data.custom_data || {};
  const customerId = String(data.customer_id || "");
  const { data: account } = customerId ? await admin.from("billing_accounts").select("*").eq("paddle_customer_id", customerId).eq("environment", environment).maybeSingle() : { data: null };

  if (event.event_type === "transaction.completed") {
    if (!account) throw new Error("Known Paddle customer mapping required.");
    const priceIds = (data.items || []).map((item: any) => String(item.price?.id || item.price_id || ""));
    const config = paymentConfiguration();
    const activation = priceIds.includes(config.activationPriceId);
    const packKey = priceIds.map(packForPrice).find(Boolean);
    const totals = data.details?.totals || data.totals || {};
    const common = { organization_id: account.organization_id, billing_account_id: account.id, environment, paddle_transaction_id: data.id, paddle_customer_id: customerId, paddle_subscription_id: data.subscription_id || null, currency: data.currency_code || null, subtotal_minor: minor(totals.subtotal), tax_minor: minor(totals.tax), total_minor: minor(totals.total), fee_minor: minor(totals.fee), seller_earnings_minor: minor(totals.earnings), receipt_url: data.invoice_url || data.receipt_url || null, status: "COMPLETED", completed_at: new Date().toISOString(), metadata: { price_ids: priceIds } };
    if (activation) {
      await admin.from("payment_transactions").upsert({ ...common, purchase_type: "PAYMENT_PROFILE", token_pack: null, tokens_granted: 0 }, { onConflict: "environment,paddle_transaction_id" });
      await admin.from("billing_accounts").update({ paddle_subscription_id: data.subscription_id || account.paddle_subscription_id, payment_profile_status: "ACTIVE", activated_at: new Date().toISOString() }).eq("id", account.id);
      const grant = await admin.rpc("activate_paddle_beta", { target_org: account.organization_id, target_reference: data.id });
      if (grant.error) throw grant.error;
      if (custom.meridian_checkout_id) await admin.from("payment_checkout_attempts").update({ status: "COMPLETED" }).eq("id", custom.meridian_checkout_id).eq("organization_id", account.organization_id);
      return;
    }
    if (!packKey) return; // Unknown catalog items never grant Tokens.
    const tokens = Number(packKey);
    const customAttemptId = String(data.custom_data?.meridian_auto_refill_attempt_id || "");
    let attemptQuery = admin.from("auto_refill_attempts").select("id,refill_tokens").eq("organization_id", account.organization_id);
    attemptQuery = customAttemptId ? attemptQuery.eq("id", customAttemptId) : attemptQuery.eq("paddle_transaction_id", data.id);
    const { data: attempt } = await attemptQuery.maybeSingle();
    const verifiedAttempt = attempt && Number(attempt.refill_tokens) === tokens ? attempt : null;
    const purchaseType = verifiedAttempt ? "AUTO_REFILL" : "TOKEN_PURCHASE";
    const payment = await admin.from("payment_transactions").upsert({ ...common, purchase_type: purchaseType, token_pack: tokens, tokens_granted: 0 }, { onConflict: "environment,paddle_transaction_id" }).select("id").single();
    if (payment.error) throw payment.error;
    const grant = await admin.rpc("grant_paddle_purchase", { target_org: account.organization_id, target_transaction: data.id, target_tokens: tokens, target_environment: environment, details: { payment_transaction_id: payment.data.id, seller_earnings_minor: minor(totals.earnings), currency: data.currency_code || null } });
    if (grant.error) throw grant.error;
    await admin.from("payment_transactions").update({ tokens_granted: tokens, token_lot_id: grant.data.token_lot_id }).eq("id", payment.data.id);
    if (custom.meridian_checkout_id) await admin.from("payment_checkout_attempts").update({ status: "COMPLETED" }).eq("id", custom.meridian_checkout_id).eq("organization_id", account.organization_id);
    if (verifiedAttempt) {
      await admin.from("auto_refill_attempts").update({ status: "COMPLETED", paddle_transaction_id: data.id, completed_at: new Date().toISOString() }).eq("id", verifiedAttempt.id);
      await admin.from("auto_refill_settings").update({ status: "ACTIVE", last_success_at: new Date().toISOString() }).eq("organization_id", account.organization_id);
    }
    return;
  }

  if (event.event_type === "transaction.payment_failed") {
    if (account) {
      await admin.from("payment_transactions").upsert({ organization_id: account.organization_id, billing_account_id: account.id, environment, paddle_transaction_id: data.id, paddle_customer_id: customerId, paddle_subscription_id: data.subscription_id || null, purchase_type: "TOKEN_PURCHASE", tokens_granted: 0, status: "FAILED", metadata: {} }, { onConflict: "environment,paddle_transaction_id" });
      await admin.from("auto_refill_attempts").update({ status: "FAILED", failure: "Paddle payment failed", completed_at: new Date().toISOString() }).eq("paddle_transaction_id", data.id).in("status", ["CREATED", "PENDING"]);
      await admin.from("auto_refill_settings").update({ status: "PAYMENT_ATTENTION_REQUIRED" }).eq("organization_id", account.organization_id).eq("enabled", true);
    }
    return;
  }
  if (event.event_type === "subscription.activated" || event.event_type === "subscription.updated") {
    if (account) await admin.from("billing_accounts").update({ paddle_subscription_id: data.id, payment_profile_status: data.status === "active" ? "ACTIVE" : "PAYMENT_ATTENTION_REQUIRED" }).eq("id", account.id);
    return;
  }
  if (event.event_type === "subscription.canceled") {
    if (account) {
      await admin.from("billing_accounts").update({ payment_profile_status: "CANCELED" }).eq("id", account.id);
      await admin.from("auto_refill_settings").update({ enabled: false, status: "PAYMENT_PROFILE_INACTIVE", disabled_at: new Date().toISOString() }).eq("organization_id", account.organization_id);
    }
    return;
  }
  if (event.event_type.startsWith("adjustment.")) {
    const transactionId = String(data.transaction_id || "");
    const { data: payment } = transactionId ? await admin.from("payment_transactions").select("organization_id,total_minor").eq("paddle_transaction_id", transactionId).eq("environment", environment).maybeSingle() : { data: null };
    await admin.from("payment_adjustments").upsert({ organization_id: payment?.organization_id || null, paddle_adjustment_id: data.id, paddle_transaction_id: transactionId || null, environment, status: data.status || event.event_type, amount_minor: minor(data.totals?.total), currency: data.currency_code || null, reconciliation_status: "PENDING", metadata: {} }, { onConflict: "environment,paddle_adjustment_id" });
    const adjustmentMinor=minor(data.totals?.total);
    const isFullRefund=payment&&adjustmentMinor!==null&&payment.total_minor!==null&&Math.abs(adjustmentMinor)>=Math.abs(Number(payment.total_minor));
    if (payment && data.status === "approved" && isFullRefund) {
      const result = await admin.rpc("reconcile_paddle_refund", { target_transaction: transactionId, target_environment: environment, details: { paddle_adjustment_id: data.id } });
      if (result.error) throw result.error;
      await admin.from("payment_adjustments").update({ reconciliation_status: result.data.status === "REFUNDED" ? "REVERSED" : "REQUIRES_REVIEW" }).eq("paddle_adjustment_id", data.id).eq("environment", environment);
    } else if(payment&&data.status==="approved") {
      await admin.from("payment_adjustments").update({reconciliation_status:"REQUIRES_REVIEW"}).eq("paddle_adjustment_id",data.id).eq("environment",environment);
    }
  }
}
