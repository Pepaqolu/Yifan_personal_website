"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { createClient } from "@/lib/supabase/server";

export type RequestState = { message: string; success?: boolean };
export async function createRequest(_: RequestState, formData: FormData): Promise<RequestState> {
  const context = await requireWorkspace();
  if (!context.organization) return { message: "No client workspace is assigned." };
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const requestType = String(formData.get("request_type") ?? "Other");
  const priority = String(formData.get("priority") ?? "MEDIUM");
  if (title.length < 3 || description.length < 10) return { message: "Add a clear title and a little more context." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("requests").insert({ organization_id: context.organization.id, title, description, request_type: requestType, priority, status: "SUBMITTED", created_by: context.user.id }).select("id").single();
  if (error) return { message: "Your request could not be submitted. Please try again." };
  await supabase.from("activity").insert({ organization_id: context.organization.id, actor_id: context.user.id, action: `Request submitted: ${title}`, entity_type: "request", entity_id: data.id });
  revalidatePath("/desk/app");
  revalidatePath("/desk/app/requests");
  return { message: "Request submitted. Yifan will review it from the admin workspace.", success: true };
}
