import "server-only";
import type { ProviderHealth, SearchOptions, SearchProvider } from "./types";

type BraveItem={title?:string;url?:string;description?:string;page_age?:string;age?:string;extra_snippets?:string[]};
type BraveResponse={web?:{results?:BraveItem[]}};
const ENDPOINT="https://api.search.brave.com/res/v1/web/search";

function plain(value:string){return value.replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g," ").trim();}

export class BraveSearchProvider implements SearchProvider{
  readonly name="brave";
  private readonly key:string;
  constructor(key=process.env.BRAVE_SEARCH_API_KEY||""){if(!key)throw new Error("BRAVE_SEARCH_API_KEY is not configured.");this.key=key;}
  async search(query:string,options:SearchOptions={}){
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10_000);
    try{
      const params=new URLSearchParams({q:query.slice(0,400),count:String(Math.min(20,Math.max(1,options.count||10))),country:options.country||"CN",search_lang:options.searchLanguage||"zh-hans",ui_lang:"zh-CN",text_decorations:"false",result_filter:"web",extra_snippets:"true",safesearch:"moderate"});
      const response=await fetch(`${ENDPOINT}?${params}`,{headers:{Accept:"application/json","X-Subscription-Token":this.key},signal:controller.signal,cache:"no-store"});
      if(!response.ok)throw new Error(`Brave Search returned HTTP ${response.status}.`);
      const payload=await response.json() as BraveResponse;
      return (payload.web?.results||[]).flatMap((item,index)=>{try{if(!item.url||!item.title)return[];const parsed=new URL(item.url);if(!new Set(["http:","https:"]).has(parsed.protocol))return[];return[{title:plain(item.title).slice(0,500),url:parsed.toString(),domain:parsed.hostname.toLowerCase().replace(/^www\./,""),snippet:plain([item.description,...(item.extra_snippets||[])].filter(Boolean).join(" ")).slice(0,1800),publishedAt:item.page_age||null,rank:index+1,provider:this.name,metadata:{age:item.age||null}}];}catch{return[];}});
    }finally{clearTimeout(timeout);}
  }
  async healthCheck():Promise<ProviderHealth>{const started=Date.now();try{const results=await this.search("site:nmpa.gov.cn 医疗器械",{count:1});return{provider:this.name,configured:true,healthy:true,latencyMs:Date.now()-started,resultCount:results.length,error:null};}catch(error){return{provider:this.name,configured:true,healthy:false,latencyMs:Date.now()-started,resultCount:null,error:error instanceof Error?error.message:"Search failed."};}}
}

export function searchProviderConfiguration(){const requested=(process.env.SEARCH_PROVIDER||"").trim().toLowerCase();const provider=requested||"brave";const configured=provider==="brave"&&Boolean(process.env.BRAVE_SEARCH_API_KEY);return{provider,configured,supported:provider==="brave"};}
export function getSearchProvider():SearchProvider{const config=searchProviderConfiguration();if(!config.supported)throw new Error(`Unsupported search provider: ${config.provider}.`);if(!config.configured)throw new Error("SEARCH PROVIDER NOT CONFIGURED");return new BraveSearchProvider();}

