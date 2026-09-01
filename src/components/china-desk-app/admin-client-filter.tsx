import Link from "next/link";

export function AdminClientFilter({ organizations, active, basePath }: { organizations: Array<{id:string;name:string}>; active?: string; basePath: string }) {
  return <div className="mb-10 flex flex-wrap gap-x-5 gap-y-2 border-b border-line pb-5"><span className="eyebrow mr-4 text-stone">CLIENT</span><Link href={basePath} className={!active?"text-sm font-medium":"text-sm text-stone"}>All</Link>{organizations.map(org=><Link key={org.id} href={`${basePath}?organization=${org.id}`} className={active===org.id?"text-sm font-medium":"text-sm text-stone hover:text-ink"}>{org.name}</Link>)}</div>;
}
