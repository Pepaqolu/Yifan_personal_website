import { AdminClientFilter } from "@/components/china-desk-app/admin-client-filter";
import {
  Field,
  OrganizationField,
  SelectField,
  Submit,
  Textarea,
} from "@/components/china-desk-app/admin-fields";
import { PageHeader, Status } from "@/components/china-desk-app/ui";
import { researchStatuses } from "@/lib/china-desk/constants";
import {
  type ResearchReport,
  getAdminRecords,
  getOrganizations,
} from "@/lib/china-desk/data";
import { deleteResearch, saveResearch } from "../actions";

type AdminResearch = ResearchReport & {
  organization_id: string;
  organizations: { name: string } | { name: string }[];
};

function ResearchForm({
  organizations,
  item,
}: {
  organizations: Array<{ id: string; name: string }>;
  item?: AdminResearch;
}) {
  return (
    <form
      action={saveResearch}
      className="grid gap-6 border-t border-line py-8 md:grid-cols-2"
    >
      <input type="hidden" name="id" value={item?.id || ""} />
      <OrganizationField organizations={organizations} value={item?.organization_id} />
      <Field label="Title" name="title" defaultValue={item?.title} required />
      <Field label="Category" name="category" defaultValue={item?.category} required />
      <SelectField label="Status" name="status" value={item?.status} options={researchStatuses} />
      <div className="md:col-span-2">
        <Textarea label="Summary" name="summary" defaultValue={item?.summary || ""} rows={3} />
      </div>
      <div className="md:col-span-2">
        <Textarea label="Full report" name="full_content" defaultValue={item?.full_content || ""} rows={14} />
      </div>
      <div className="md:col-span-2">
        <Textarea label="Sources, one per line" name="sources" defaultValue={item?.sources?.join("\n")} rows={4} />
      </div>
      <label className="space-y-2 text-sm md:col-span-2">
        <span className="block text-xs uppercase tracking-[0.15em] text-stone">
          Add attachment
        </span>
        <input
          type="file"
          name="attachment"
          className="block w-full border-b border-line py-3 text-sm file:mr-5 file:border-0 file:bg-transparent file:p-0 file:text-sm file:text-ink"
        />
        <span className="block text-xs text-stone">Private · maximum 4 MB per upload</span>
      </label>
      {item?.attachments.length ? (
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.15em] text-stone">Attached</p>
          <ul className="mt-3 space-y-2 text-sm">
            {item.attachments.map((attachment) => (
              <li key={attachment.path}>{attachment.name}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <Submit />
    </form>
  );
}

export default async function AdminResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ organization?: string }>;
}) {
  const { organization } = await searchParams;
  const organizations = await getOrganizations();
  const items = await getAdminRecords<AdminResearch>("research_reports", organization);

  return (
    <>
      <PageHeader
        eyebrow="RESEARCH"
        title="Write inside the desk."
        description="Create, develop, and publish research without touching the database."
      />
      <AdminClientFilter organizations={organizations} active={organization} basePath="/admin/research" />
      <details className="mb-14">
        <summary className="cursor-pointer border-b border-ink/25 pb-1 text-sm">
          Create research →
        </summary>
        <ResearchForm organizations={organizations} />
      </details>
      {items.map((item) => {
        const org = Array.isArray(item.organizations)
          ? item.organizations[0]
          : item.organizations;
        return (
          <details key={item.id} className="border-t border-line py-7">
            <summary className="cursor-pointer list-none">
              <div className="grid gap-3 md:grid-cols-12">
                <div className="md:col-span-7">
                  <h2 className="text-xl font-medium">{item.title}</h2>
                  <p className="mt-2 text-xs text-stone">{org?.name} · {item.category}</p>
                </div>
                <p className="text-sm text-stone md:col-span-3">{item.summary}</p>
                <div className="md:col-span-2"><Status>{item.status}</Status></div>
              </div>
            </summary>
            <ResearchForm organizations={organizations} item={item} />
            <form action={deleteResearch}>
              <input type="hidden" name="id" value={item.id} />
              <button className="text-xs text-accent">Delete research</button>
            </form>
          </details>
        );
      })}
    </>
  );
}
