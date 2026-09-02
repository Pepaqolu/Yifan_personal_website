import Link from "next/link";
import { Field, Submit } from "@/components/china-desk-app/admin-fields";
import { PageHeader, formatDate } from "@/components/china-desk-app/ui";
import { getOrganizations } from "@/lib/china-desk/data";
import { saveOrganization } from "../actions";

export default async function ClientsPage(){const items=await getOrganizations();return <><PageHeader eyebrow="CLIENTS" title="Client workspaces." description="Every organization is a private, isolated Meridian."/><details className="mb-16"><summary className="cursor-pointer border-b border-ink/25 pb-1 text-sm">Create client workspace →</summary><form action={saveOrganization} className="mt-8 grid gap-6 border-t border-line py-8 md:grid-cols-2"><Field label="Organization name" name="name" required/><Field label="URL slug" name="slug" required pattern="[a-z0-9-]+"/><div><Submit>Create workspace</Submit></div></form></details><div className="border-t border-line">{items.map(item=><Link key={item.id} href={`/admin/clients/${item.id}`} className="grid gap-3 border-b border-line py-8 md:grid-cols-12 md:items-baseline"><h2 className="text-2xl font-medium tracking-[-0.04em] md:col-span-6">{item.name}</h2><p className="text-sm text-stone md:col-span-3">{item.slug}</p><p className="text-xs text-stone md:col-span-2">{formatDate(item.created_at)}</p><span className="text-accent">→</span></Link>)}</div></>}
