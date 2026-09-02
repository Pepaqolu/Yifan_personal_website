"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { createClient } from "@/lib/supabase/server";

const profileFields = [
  ["company_overview", "Company overview", "Company"],
  ["products", "Products", "Products"],
  ["target_customers", "Target customers", "Target Customers"],
  ["target_geography", "Target geography", "Target Markets"],
  ["china_objectives", "China objectives", "Commercial Strategy"],
  ["pricing", "Pricing", "Pricing"],
  ["business_model", "Business model", "Commercial Strategy"],
  ["existing_partners", "Existing partners", "Existing Partners"],
  ["known_competitors", "Known competitors", "Competitors"],
  ["market_assumptions", "Market assumptions", "Other Context"],
  ["commercial_constraints", "Commercial constraints", "Other Context"],
  ["important_decisions", "Important decisions", "Important Decisions"],
] as const;

export async function saveCompanyContext(form: FormData) {
  await requireWorkspace();
  const answers = profileFields.map(([name, title, category]) => ({ title, category, content: String(form.get(name) ?? "").trim() }));
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_company_context", { answers });
  if (error) throw new Error("Company context could not be saved.");
  revalidatePath("/meridian/app/knowledge");
}
