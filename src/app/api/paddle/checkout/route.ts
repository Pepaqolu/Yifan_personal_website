import { NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/china-desk/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { paymentConfiguration } from "@/lib/payments/config";
import { createPaddleCustomer, customerAuthToken } from "@/lib/payments/paddle";
import { isTokenPack, type TokenPack } from "@/config/paymentCatalog";

export async function POST(request: Request) {
  try {
    const context = await getWorkspaceContext();
    if (!context) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    if (!context.organization) return NextResponse.json({ error: "Client workspace required." }, { status: 403 });
    const config = paymentConfiguration();
    if (!config.configured) return NextResponse.json({ error: "Payments are temporarily unavailable." }, { status: 503 });
    const body = await request.json().catch(() => ({}));
    const type = body.type === "activation" ? "PAYMENT_PROFILE" : "TOKEN_PURCHASE";
    const pack = Number(body.pack);
    if (type === "TOKEN_PURCHASE" && !isTokenPack(pack)) return NextResponse.json({ error: "Choose an approved Token pack." }, { status: 400 });

    const admin = createAdminClient();
    const tenMinutesAgo = new Date(Date.now() - 600_000).toISOString();
    const { count } = await admin.from("payment_checkout_attempts").select("id", { count: "exact", head: true }).eq("organization_id", context.organization.id).gte("created_at", tenMinutesAgo);
    if ((count || 0) >= 10) return NextResponse.json({ error: "Please wait before opening another checkout." }, { status: 429 });

    let { data: account } = await admin.from("billing_accounts").select("*").eq("organization_id", context.organization.id).maybeSingle();
    if (!account) {
      if (!context.user.email) return NextResponse.json({ error: "A verified account email is required." }, { status: 409 });
      const customer = await createPaddleCustomer(context.user.email, [context.profile.first_name, context.profile.last_name].filter(Boolean).join(" "));
      const result = await admin.from("billing_accounts").upsert({ organization_id: context.organization.id, environment: config.environment, paddle_customer_id: customer.id, payment_profile_status: "PENDING" }, { onConflict: "organization_id" }).select("*").single();
      if (result.error) throw result.error;
      account = result.data;
    }
    if (account.environment !== config.environment) return NextResponse.json({ error: "Payment environment mismatch." }, { status: 409 });
    if (type === "TOKEN_PURCHASE" && account.payment_profile_status !== "ACTIVE") return NextResponse.json({ error: "Activate your Payment Profile before purchasing Tokens." }, { status: 409 });
    if (type === "PAYMENT_PROFILE" && account.payment_profile_status === "ACTIVE") return NextResponse.json({ error: "Your Payment Profile is already active." }, { status: 409 });

    const attemptId = crypto.randomUUID();
    const created = await admin.from("payment_checkout_attempts").insert({ organization_id: context.organization.id, requested_by: context.user.id, checkout_type: type, token_pack: type === "TOKEN_PURCHASE" ? pack : null, idempotency_key: attemptId, status: "OPENED" });
    if (created.error) throw created.error;
    const auth = await customerAuthToken(account.paddle_customer_id);
    const priceId = type === "PAYMENT_PROFILE" ? config.activationPriceId : config.packIds[pack as TokenPack];
    return NextResponse.json({ clientToken: config.clientToken, environment: config.environment, priceId, customerAuthToken: auth.customer_auth_token, customData: { meridian_organization_id: context.organization.id, meridian_checkout_id: attemptId, meridian_purchase_type: type, meridian_environment: config.environment } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout could not be opened." }, { status: 500 });
  }
}
