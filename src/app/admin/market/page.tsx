import { AdminClientFilter } from "@/components/china-desk-app/admin-client-filter";
import {
  Field,
  OrganizationField,
  SelectField,
  Submit,
  Textarea,
} from "@/components/china-desk-app/admin-fields";
import { PageHeader, Status } from "@/components/china-desk-app/ui";
import { priorities } from "@/lib/china-desk/constants";
import {
  type MarketUpdate,
  getAdminRecords,
  getOrganizations,
} from "@/lib/china-desk/data";
import { saveMarketUpdate } from "../actions";

const categories = [
  "Market",
  "Competitor",
  "Regulation",
  "Pricing",
  "Partner",
  "Customer",
  "Other",
] as const;

type AdminMarket = MarketUpdate & {
  organization_id: string;
  organizations: { name: string } | { name: string }[];
};

function MarketForm({
  organizations,
  item,
}: {
  organizations: Array<{ id: string; name: string }>;
  item?: AdminMarket;
}) {
  return (
    <form
      action={saveMarketUpdate}
      className="grid gap-6 border-t border-line py-8 md:grid-cols-2"
    >
      <input type="hidden" name="id" value={item?.id || ""} />
      <OrganizationField organizations={organizations} value={item?.organization_id} />
      <Field label="Title" name="title" defaultValue={item?.title} required />
      <div className="md:col-span-2">
        <Textarea label="Summary" name="summary" defaultValue={item?.summary} rows={3} required />
      </div>
      <SelectField label="Category" name="category" value={item?.category} options={categories} />
      <SelectField label="Priority" name="priority" value={item?.priority} options={priorities} />
      <Field label="Source name" name="source_name" defaultValue={item?.source_name || ""} />
      <Field label="Source URL" name="source_url" type="url" defaultValue={item?.source_url || ""} />
      <div className="md:col-span-2">
        <Textarea label="Notes" name="notes" defaultValue={item?.notes || ""} rows={3} />
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="published" defaultChecked={Boolean(item?.published_at)} />
        Published to client
      </label>
      <div><Submit /></div>
    </form>
  );
}

export default async function AdminMarketPage({
  searchParams,
}: {
  searchParams: Promise<{ organization?: string }>;
}) {
  const { organization } = await searchParams;
  const organizations = await getOrganizations();
  const items = await getAdminRecords<AdminMarket>("market_updates", organization);

  return (
    <>
      <PageHeader
        eyebrow="MARKET"
        title="Publish market context."
        description="Assign a development to one client and control when it becomes visible."
      />
      <AdminClientFilter organizations={organizations} active={organization} basePath="/admin/market" />
      <details className="mb-14">
        <summary className="cursor-pointer border-b border-ink/25 pb-1 text-sm">
          Add market update →
        </summary>
        <MarketForm organizations={organizations} />
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
                <div className="md:col-span-2"><Status>{item.priority}</Status></div>
                <p className="text-xs text-stone md:col-span-3">
                  {item.published_at ? "Published" : "Draft"}
                </p>
              </div>
            </summary>
            <MarketForm organizations={organizations} item={item} />
          </details>
        );
      })}
    </>
  );
}
