import { Status } from "./ui";
import type { SearchTraceRecord } from "@/lib/meridian-intelligence/data";

const intentLabels:Record<string,string>={DISTRIBUTOR:"Distributor discovery",PARTNER:"Partner discovery",CUSTOMER:"Customer discovery",SUPPLIER:"Supplier discovery",COMPETITOR:"Competitor intelligence",REGULATORY:"Regulatory research",TENDER:"Tender discovery",PRICING:"Pricing intelligence",COMPANY:"Company activity",MARKET:"Market signals"};
const human=(value:string)=>value.replaceAll("_"," ").toLowerCase().replace(/^./,(letter)=>letter.toUpperCase());

export function SearchTrace({items}:{items:SearchTraceRecord[]}){
  const searched=items.filter((item)=>item.run);
  const resultCount=searched.reduce((sum,item)=>sum+item.resultCount,0);
  const qualifyingCount=searched.reduce((sum,item)=>sum+item.qualifyingCount,0);
  const sourceTypes=[...new Set(searched.flatMap((item)=>item.sourceTypes))];
  return <section className="mt-28 max-w-5xl border-t border-line pt-10">
    <p className="eyebrow text-accent">SEARCH TRACE</p>
    <div className="mt-5 grid gap-8 md:grid-cols-12 md:items-end"><div className="md:col-span-8"><h2 className="text-[clamp(2.4rem,5vw,4.8rem)] font-medium leading-[0.94] tracking-[-0.06em]">See what Meridian searched.</h2><p className="mt-5 max-w-2xl text-sm leading-6 text-charcoal">A readable record of the real searches behind your findings. Technical Chinese terms remain available only when you choose to inspect them.</p></div><dl className="grid grid-cols-2 gap-5 md:col-span-4"><div><dt className="eyebrow text-stone">RESULTS FOUND</dt><dd className="mt-2 text-3xl tracking-[-0.05em]">{resultCount}</dd></div><div><dt className="eyebrow text-stone">QUALIFYING</dt><dd className="mt-2 text-3xl tracking-[-0.05em]">{qualifyingCount}</dd></div></dl></div>
    {sourceTypes.length?<p className="mt-8 text-xs text-stone">Sources represented: {sourceTypes.map(human).join(" · ")}</p>:null}
    <div className="mt-10 border-t border-line">{items.map((item)=><article key={item.id} className="border-b border-line py-7">
      <div className="grid gap-5 md:grid-cols-12 md:items-start"><div className="md:col-span-3"><p className="eyebrow text-stone">{intentLabels[item.intent.toUpperCase()]||human(item.intent)}</p><p className="mt-3 text-xs text-charcoal">Priority {item.priority}</p></div><div className="md:col-span-6"><h3 className="text-xl font-medium tracking-[-0.035em]">{item.rationale}</h3><p className="mt-3 text-sm leading-6 text-charcoal">Meridian looked across {item.preferred_source_types.map(human).join(", ").toLowerCase()||"relevant China sources"} because they are appropriate for this question.</p></div><div className="flex items-center justify-between gap-4 md:col-span-3 md:justify-end"><span className="text-xs text-stone">{item.resultCount} found · {item.qualifyingCount} qualifying</span><Status>{item.run?.status||"Prepared"}</Status></div></div>
      <details className="mt-6 md:ml-[25%]"><summary className="cursor-pointer text-xs text-stone transition-colors hover:text-accent">Sources and search rationale →</summary><div className="mt-5 grid gap-5 border-l border-line pl-5 sm:grid-cols-2"><div><p className="eyebrow text-stone">SOURCE CATEGORIES</p><p className="mt-2 text-sm text-charcoal">{(item.sourceTypes.length?item.sourceTypes:item.preferred_source_types).map(human).join(" · ")}</p></div><div><p className="eyebrow text-stone">SEARCH STATUS</p><p className="mt-2 text-sm text-charcoal">{item.run?`${item.run.result_count} returned · ${item.run.official_source_count} authoritative · ${item.run.failure_count} failed`:`Prepared, not yet run`}</p></div></div>
        <details className="mt-6 border-l border-line pl-5"><summary className="cursor-pointer text-xs text-stone transition-colors hover:text-accent">Exact search detail →</summary><div className="mt-4 space-y-4"><div><p className="eyebrow text-stone">RAW QUERY · {item.query_language}</p><p className="mt-2 break-words font-mono text-xs leading-6 text-ink">{item.query}</p></div>{item.product_terms.length?<div><p className="eyebrow text-stone">PRODUCT TERMS USED</p><p className="mt-2 text-sm leading-6 text-charcoal">{item.product_terms.join(" · ")}</p></div>:null}</div></details>
      </details>
    </article>)}</div>
  </section>;
}
