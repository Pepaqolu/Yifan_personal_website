"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getTrustedSiteUrl } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/china-desk/auth";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const optional = (form: FormData, key: string) => text(form, key) || null;
const lines = (form: FormData, key: string) => text(form, key).split("\n").map(item=>item.trim()).filter(Boolean);

async function activity(organizationId: string, action: string, entityType: string, entityId?: string) {
  const context = await requireAdmin(); const supabase = await createClient();
  await supabase.from("activity").insert({ organization_id: organizationId, actor_id: context.user.id, action, entity_type: entityType, entity_id: entityId || null });
}

export async function saveOrganization(form: FormData) {
  await requireAdmin(); const supabase=await createClient(); const name=text(form,"name"); const slug=text(form,"slug"); if(!name||!slug) throw new Error("Organization name and slug are required.");
  const { error }=await supabase.from("organizations").insert({name,slug}); if(error) throw new Error(error.message); revalidatePath("/admin/clients");
}

export async function inviteClient(form: FormData) {
  await requireAdmin(); const organizationId=text(form,"organization_id"); const email=text(form,"email"); const firstName=text(form,"first_name"); const title=optional(form,"title");
  if(!organizationId||!email) throw new Error("Organization and email are required."); const admin=createAdminClient();
  const { data, error }=await admin.auth.admin.inviteUserByEmail(email,{data:{first_name:firstName},redirectTo:`${getTrustedSiteUrl()}/auth/callback?next=/meridian/login/update-password`}); if(error) throw new Error(error.message);
  await admin.from("profiles").upsert({id:data.user.id,first_name:firstName||null,role:"CLIENT"}); await admin.from("organization_members").upsert({organization_id:organizationId,user_id:data.user.id,title});
  await activity(organizationId,`Client invited: ${email}`,"member",data.user.id); revalidatePath(`/admin/clients/${organizationId}`);
}

export async function saveMarketUpdate(form: FormData) {
  const context=await requireAdmin(); const supabase=await createClient(); const id=text(form,"id"); const organizationId=text(form,"organization_id"); const payload={organization_id:organizationId,title:text(form,"title"),summary:text(form,"summary"),category:text(form,"category"),priority:text(form,"priority"),source_url:optional(form,"source_url"),source_name:optional(form,"source_name"),notes:optional(form,"notes"),published_at:form.get("published")?new Date().toISOString():null,created_by:context.user.id};
  const query=id?supabase.from("market_updates").update(payload).eq("id",id):supabase.from("market_updates").insert(payload); const {data,error}=await query.select("id").single(); if(error) throw new Error(error.message); await activity(organizationId,`${id?"Market update edited":"Market update published"}: ${payload.title}`,"market_update",data.id); revalidatePath("/admin/market"); revalidatePath("/meridian/app/market");
}

export async function saveCompetitor(form: FormData) {
  const context=await requireAdmin(); const supabase=await createClient(); const id=text(form,"id"); const organizationId=text(form,"organization_id"); const internalNotes=optional(form,"internal_notes"); const payload={organization_id:organizationId,company_name:text(form,"company_name"),chinese_name:optional(form,"chinese_name"),website:optional(form,"website"),location:optional(form,"location"),segment:optional(form,"segment"),description:optional(form,"description"),products:lines(form,"products"),pricing_notes:optional(form,"pricing_notes"),positioning:optional(form,"positioning"),recent_activity:optional(form,"recent_activity"),priority:text(form,"priority")||"MEDIUM",external_client_notes:optional(form,"external_client_notes"),sources:lines(form,"sources"),created_by:context.user.id};
  const query=id?supabase.from("competitors").update(payload).eq("id",id):supabase.from("competitors").insert(payload); const {data,error}=await query.select("id").single(); if(error) throw new Error(error.message); if(internalNotes!==null) await supabase.from("competitor_internal_notes").upsert({competitor_id:data.id,content:internalNotes}); await activity(organizationId,`${id?"Competitor updated":"New competitor added"}: ${payload.company_name}`,"competitor",data.id); revalidatePath("/admin/competitors"); revalidatePath("/meridian/app/competitors");
}
export async function deleteCompetitor(form: FormData) { await requireAdmin(); const supabase=await createClient(); const id=text(form,"id"); const organizationId=text(form,"organization_id"); const {error}=await supabase.from("competitors").delete().eq("id",id); if(error)throw new Error(error.message); await activity(organizationId,"Competitor removed","competitor",id); revalidatePath("/admin/competitors"); }

export async function savePartner(form: FormData) {
  const context=await requireAdmin(); const supabase=await createClient(); const id=text(form,"id"); const organizationId=text(form,"organization_id"); const internalNotes=optional(form,"internal_notes"); const payload={organization_id:organizationId,company_name:text(form,"company_name"),chinese_name:optional(form,"chinese_name"),partner_type:text(form,"partner_type"),location:optional(form,"location"),website:optional(form,"website"),contact_person:optional(form,"contact_person"),contact_role:optional(form,"contact_role"),wechat:optional(form,"wechat"),email:optional(form,"email"),phone:optional(form,"phone"),english_ability:optional(form,"english_ability"),interest_level:optional(form,"interest_level"),status:text(form,"status")||"IDENTIFIED",last_contact:optional(form,"last_contact"),notes:optional(form,"notes"),source:optional(form,"source"),created_by:context.user.id};
  const query=id?supabase.from("partners").update(payload).eq("id",id):supabase.from("partners").insert(payload); const {data,error}=await query.select("id").single(); if(error)throw new Error(error.message); if(internalNotes!==null)await supabase.from("partner_internal_notes").upsert({partner_id:data.id,content:internalNotes}); await activity(organizationId,`${id?"Partner updated":"New partner added"}: ${payload.company_name}`,"partner",data.id); revalidatePath("/admin/partners"); revalidatePath("/meridian/app/partners");
}
export async function deletePartner(form: FormData){await requireAdmin();const supabase=await createClient();const id=text(form,"id");const organizationId=text(form,"organization_id");const{error}=await supabase.from("partners").delete().eq("id",id);if(error)throw new Error(error.message);await activity(organizationId,"Partner removed","partner",id);revalidatePath("/admin/partners");}

export async function saveResearch(form: FormData) {
  const context = await requireAdmin();
  const supabase = await createClient();
  const id = text(form, "id");
  const organizationId = text(form, "organization_id");
  const attachment = form.get("attachment");
  const payload = {
    organization_id: organizationId,
    title: text(form, "title"),
    category: text(form, "category"),
    summary: optional(form, "summary"),
    status: text(form, "status") || "REQUESTED",
    full_content: optional(form, "full_content"),
    sources: lines(form, "sources"),
    created_by: context.user.id,
  };
  const query = id
    ? supabase.from("research_reports").update(payload).eq("id", id)
    : supabase.from("research_reports").insert({ ...payload, attachments: [] });
  const { data, error } = await query.select("id,attachments").single();
  if (error) throw new Error(error.message);

  if (attachment instanceof File && attachment.size > 0) {
    if (attachment.size > 4 * 1024 * 1024) {
      throw new Error("Attachments must be 4 MB or smaller.");
    }
    const safeName = attachment.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${organizationId}/${data.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("research-attachments")
      .upload(path, attachment, {
        contentType: attachment.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadError) throw new Error(uploadError.message);
    const attachments = Array.isArray(data.attachments) ? data.attachments : [];
    const { error: attachmentError } = await supabase
      .from("research_reports")
      .update({
        attachments: [
          ...attachments,
          {
            name: attachment.name,
            path,
            size: attachment.size,
            type: attachment.type || "application/octet-stream",
          },
        ],
      })
      .eq("id", data.id);
    if (attachmentError) throw new Error(attachmentError.message);
  }

  await activity(
    organizationId,
    `${payload.status === "COMPLETED" ? "Research completed" : "Research updated"}: ${payload.title}`,
    "research",
    data.id,
  );
  revalidatePath("/admin/research");
  revalidatePath("/meridian/app/research");
}
export async function deleteResearch(form: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = text(form, "id");
  const { data: report } = await supabase
    .from("research_reports")
    .select("attachments")
    .eq("id", id)
    .single();
  const paths = Array.isArray(report?.attachments)
    ? report.attachments
        .map((item) =>
          typeof item === "object" && item && "path" in item
            ? String(item.path)
            : "",
        )
        .filter(Boolean)
    : [];
  if (paths.length) {
    const { error: storageError } = await supabase.storage
      .from("research-attachments")
      .remove(paths);
    if (storageError) throw new Error(storageError.message);
  }
  const { error } = await supabase.from("research_reports").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/research");
}

export async function updateRequest(form: FormData) {
  await requireAdmin();const supabase=await createClient();const id=text(form,"id");const organizationId=text(form,"organization_id");const status=text(form,"status");const message=optional(form,"message");const{data:existing}=await supabase.from("requests").select("updates,title").eq("id",id).single();const updates=Array.isArray(existing?.updates)?existing.updates:[];if(message)updates.push({message,created_at:new Date().toISOString()});const{error}=await supabase.from("requests").update({status,updates}).eq("id",id);if(error)throw new Error(error.message);await activity(organizationId,`Request updated: ${existing?.title||"Request"}`,"request",id);revalidatePath("/admin/requests");revalidatePath("/meridian/app/requests");
}

export async function saveKnowledge(form: FormData) {
  const context=await requireAdmin();const supabase=await createClient();const organizationId=text(form,"organization_id");const payload={organization_id:organizationId,title:text(form,"title"),category:text(form,"category"),content:text(form,"content"),tags:text(form,"tags").split(",").map(item=>item.trim()).filter(Boolean),source:optional(form,"source"),created_by:context.user.id};const{data,error}=await supabase.from("knowledge_items").insert(payload).select("id").single();if(error)throw new Error(error.message);await activity(organizationId,`Knowledge added: ${payload.title}`,"knowledge",data.id);revalidatePath(`/admin/clients/${organizationId}`);revalidatePath("/meridian/app/knowledge");
}
