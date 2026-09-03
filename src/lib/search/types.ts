import type { QueryIntent } from "@/lib/meridian-intelligence/types";

export type ProviderSearchResult={title:string;url:string;domain:string;snippet:string;publishedAt:string|null;rank:number;provider:string;metadata:Record<string,unknown>};
export type SearchOptions={count?:number;country?:string;searchLanguage?:string};
export type ProviderHealth={provider:string;configured:boolean;healthy:boolean;latencyMs:number|null;resultCount:number|null;error:string|null};

export interface SearchProvider{
  readonly name:string;
  search(query:string,options?:SearchOptions):Promise<ProviderSearchResult[]>;
  healthCheck():Promise<ProviderHealth>;
}

export type SearchQueryPlan={id:string;organization_id:string;product_id:string;intent:QueryIntent;query:string;query_language:string;preferred_source_types:string[];product_terms:string[];rationale:string;priority:number};

export type RankedSearchResult=ProviderSearchResult&{
  sourceType:"AUTHORITATIVE"|"COMMERCIAL"|"MARKET";
  sourceAuthority:"PRIMARY"|"HIGH"|"MEDIUM"|"LOW";
  meridianScore:number;
  meridianRank:number;
  rankingReasons:string[];
};

