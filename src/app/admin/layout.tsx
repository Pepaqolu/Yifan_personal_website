import type { ReactNode } from "react";
import { WorkspaceShell } from "@/components/china-desk-app/workspace-shell";
import { requireAdmin } from "@/lib/china-desk/auth";
import { adminNavigation } from "@/lib/china-desk/constants";

export const dynamic="force-dynamic";
export default async function AdminLayout({children}:{children:ReactNode}){const context=await requireAdmin();return <WorkspaceShell context={context} navigation={adminNavigation} label="Admin workspace">{children}</WorkspaceShell>;}
