import { NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { type ResearchAttachment } from "@/lib/china-desk/data";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; index: string }> },
) {
  const context = await requireWorkspace();
  const { id, index } = await params;
  const attachmentIndex = Number.parseInt(index, 10);
  if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0) {
    return new NextResponse("Attachment not found", { status: 404 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("research_reports")
    .select("attachments")
    .eq("id", id)
    .eq("organization_id", context.organization!.id)
    .eq("status", "COMPLETED")
    .single();
  if (error || !data) return new NextResponse("Attachment not found", { status: 404 });

  const attachments = Array.isArray(data.attachments)
    ? (data.attachments as unknown as ResearchAttachment[])
    : [];
  const attachment = attachments[attachmentIndex];
  if (!attachment?.path) return new NextResponse("Attachment not found", { status: 404 });

  const { data: signed, error: signedError } = await supabase.storage
    .from("research-attachments")
    .createSignedUrl(attachment.path, 60, { download: attachment.name });
  if (signedError || !signed?.signedUrl) {
    return new NextResponse("Attachment unavailable", { status: 404 });
  }

  return NextResponse.redirect(new URL(signed.signedUrl, request.url));
}
