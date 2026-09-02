"use server";

import { redirect } from "next/navigation";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { createClient } from "@/lib/supabase/server";

const fields = [
  ["company", "Company overview", "Company"],
  ["products", "Products and services for China", "Products"],
  ["goals", "China objectives", "Commercial Strategy"],
  ["customers", "Target customers", "Target Customers"],
  ["regions", "Target geography", "Target Markets"],
  ["partners", "Existing Chinese partners", "Existing Partners"],
  ["competitors", "Known competitors", "Competitors"],
  ["questions", "Questions to answer", "Other Context"],
] as const;

export async function completeOnboarding(form: FormData) {
  const context = await requireWorkspace();
  if (!context.organization) redirect("/admin");
  const answers = fields.map(([name, title, category]) => ({
    title,
    category,
    content: String(form.get(name) ?? "").trim(),
  }));
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_client_onboarding", { answers, skip_onboarding: false });
  if (error) throw new Error("Your company context could not be saved.");
  redirect("/desk/app");
}

export async function skipOnboarding() {
  const context = await requireWorkspace();
  if (!context.organization) redirect("/admin");
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_client_onboarding", { answers: [], skip_onboarding: true });
  if (error) throw new Error("Onboarding could not be skipped.");
  redirect("/desk/app");
}
