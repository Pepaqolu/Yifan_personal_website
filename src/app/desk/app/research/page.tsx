import Link from "next/link";
import {
  EmptyState,
  PageHeader,
  Status,
  formatDate,
} from "@/components/china-desk-app/ui";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { getResearchReports } from "@/lib/china-desk/data";

export default async function ResearchPage() {
  const context = await requireWorkspace();
  const items = await getResearchReports(context.organization!.id);

  return (
    <>
      <PageHeader
        eyebrow="RESEARCH"
        title="A working library."
        description="Completed research remains connected to the questions and decisions around it."
      />
      {items.length ? (
        <div className="border-t border-line">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 border-b border-line py-8 md:grid-cols-12"
            >
              <div className="md:col-span-4">
                <h2 className="text-2xl font-medium tracking-[-0.04em]">{item.title}</h2>
                <p className="mt-3 text-xs text-stone">
                  {item.category} · {formatDate(item.updated_at)}
                </p>
              </div>
              <div className="md:col-span-6">
                <p className="leading-7 text-stone">{item.summary}</p>
                {item.full_content ? (
                  <details className="mt-5">
                    <summary className="cursor-pointer text-sm">Read report →</summary>
                    <div className="mt-5 whitespace-pre-wrap text-sm leading-7">
                      {item.full_content}
                    </div>
                  </details>
                ) : null}
                {item.attachments.length ? (
                  <div className="mt-6 border-t border-line pt-5">
                    <p className="eyebrow text-stone">Attachments</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {item.attachments.map((attachment, index) => (
                        <li key={attachment.path}>
                          <Link
                            href={`/desk/app/research/${item.id}/attachments/${index}`}
                            className="border-b border-ink/20 pb-1 transition-colors hover:border-accent hover:text-accent"
                          >
                            {attachment.name} ↓
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              <div className="md:col-span-2"><Status>{item.status}</Status></div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No completed research yet."
          description="Published reports and working research will appear here."
        />
      )}
    </>
  );
}
