"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { createClient } from "@/lib/supabase/server";
import { attemptAutoRefill } from "@/lib/payments/auto-refill";

export type BillingActionState = { message: string; success?: boolean };

export async function saveAutoRefill(state: BillingActionState, form: FormData): Promise<BillingActionState> {
  void state;
  try {
    await requireWorkspace();
    const trigger = Number(form.get("trigger_tokens"));
    const refill = Number(form.get("refill_tokens"));
    const cap = Number(form.get("monthly_cap_usd"));
    const enabled = form.get("enabled") === "true";
    const supabase = await createClient();
    const { error } = await supabase.rpc("save_auto_refill_settings", { trigger_value: trigger, refill_value: refill, cap_value: cap, enable_value: enabled, consent: "2026-09-04" });
    if (error) throw error;
    revalidatePath("/meridian/app/tokens");
    return { message: enabled ? "Auto-Refill enabled ✓" : "Auto-Refill disabled ✓", success: true };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Auto-Refill could not be updated." };
  }
}

export async function retryAutoRefill(state: BillingActionState): Promise<BillingActionState> {
  void state;
  try {
    const context = await requireWorkspace();
    if (!context.organization) throw new Error("Client workspace required.");
    const result = await attemptAutoRefill(context.organization.id, "USER_RETRY");
    revalidatePath("/meridian/app/tokens");
    return {
      message: result.status === "PENDING" ? "Payment requested. Tokens will appear after Paddle confirms payment." : result.status === "CAP_REACHED" ? "Your monthly Auto-Refill limit has been reached." : result.status === "FAILED" ? "Payment was not successful. Your balance is unchanged." : "No refill is currently required.",
      success: result.status === "PENDING",
    };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Auto-Refill could not be retried." };
  }
}
