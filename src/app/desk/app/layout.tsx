import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/china-desk-app/workspace-shell";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { clientNavigation } from "@/lib/china-desk/constants";

export const dynamic = "force-dynamic";
export default async function ClientAppLayout({ children }: { children: ReactNode }) {
  const context = await requireWorkspace();
  if (!context.organization) redirect("/admin");
  return <WorkspaceShell context={context} navigation={clientNavigation} label="Client workspace">{children}</WorkspaceShell>;
}
