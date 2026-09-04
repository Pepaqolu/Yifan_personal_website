import { NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/china-desk/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { customerPortal } from "@/lib/payments/paddle";

export async function POST() {
  try {
    const context = await getWorkspaceContext();
    if (!context) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    if (!context.organization) return NextResponse.json({ error: "Client workspace required." }, { status: 403 });
    const admin = createAdminClient();
    const { data } = await admin.from("billing_accounts").select("paddle_customer_id,paddle_subscription_id").eq("organization_id", context.organization.id).single();
    if (!data) return NextResponse.json({ error: "Activate your Payment Profile first." }, { status: 409 });
    const portal = await customerPortal(data.paddle_customer_id, data.paddle_subscription_id);
    return NextResponse.json({ url: portal.urls.subscriptions?.[0]?.update_subscription_payment_method || portal.urls.general.overview });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment management is unavailable." }, { status: 500 });
  }
}
