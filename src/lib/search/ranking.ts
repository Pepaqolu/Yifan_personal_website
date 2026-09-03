import { classifySource } from "@/lib/meridian-intelligence/retrieval";
import type { ProviderSearchResult, RankedSearchResult, SearchQueryPlan } from "./types";

const trustedDomains=new Map<string,number>([["nmpa.gov.cn",100],["cmde.org.cn",95],["samr.gov.cn",95],["gov.cn",90],["ccgp.gov.cn",95]]);
function domainScore(domain:string){for(const [trusted,score] of trustedDomains)if(domain===trusted||domain.endsWith(`.${trusted}`))return score;return domain.endsWith(".gov.cn")?88:50;}
function tokens(value:string){const lower=value.toLowerCase();const latin=lower.match(/[a-z0-9]{2,}/g)||[];const han=lower.match(/[\u3400-\u9fff]+/g)?.flatMap((group)=>group.length<3?[group]:Array.from({length:group.length-1},(_,i)=>group.slice(i,i+2)))||[];return[...new Set([...latin,...han])].slice(0,50);}
function overlap(needles:string[],text:string){if(!needles.length)return 0;const hits=needles.filter((token)=>text.includes(token)).length;return hits/needles.length;}
function ageScore(value:string|null){if(!value)return 35;const date=new Date(value);if(Number.isNaN(date.getTime()))return 35;const days=(Date.now()-date.getTime())/86400000;return days<90?100:days<365?75:days<1095?50:25;}

export function rankSearchResults(plan:SearchQueryPlan,results:ProviderSearchResult[]):RankedSearchResult[]{
  const queryTokens=tokens(`${plan.query} ${plan.product_terms.join(" ")}`);
  const ranked=results.map((result)=>{const classification=classifySource(result.url);const haystack=`${result.title} ${result.snippet} ${result.domain}`.toLowerCase();const authority=domainScore(result.domain);const relevance=Math.round(overlap(queryTokens,haystack)*100);const recency=ageScore(result.publishedAt);const preferred=plan.preferred_source_types.includes(classification.sourceType)?100:35;let intent=50;
    if(plan.intent.startsWith("FIND_REG")||plan.intent==="FIND_STANDARDS")intent=classification.sourceType==="AUTHORITATIVE"?100:25;
    if(plan.intent==="FIND_TENDERS")intent=/采购|招标|中标|tender|procurement/i.test(haystack)?100:35;
    if(plan.intent==="DISCOVER_DISTRIBUTORS")intent=/经销|代理|产品|医疗器械|distributor/i.test(haystack)?90:35;
    const providerPosition=Math.max(10,100-(result.rank-1)*7);const score=Math.max(0,Math.min(100,Math.round(authority*.28+relevance*.27+preferred*.16+intent*.14+recency*.08+providerPosition*.07)));const reasons=[`Authority ${authority}/100`,`Query relevance ${relevance}/100`,`Intent match ${intent}/100`,classification.sourceType==="AUTHORITATIVE"?"Official-source priority":"Source classified by domain"];
    return{...result,sourceType:classification.sourceType,sourceAuthority:classification.authorityLevel,meridianScore:score,meridianRank:0,rankingReasons:reasons};}).sort((a,b)=>b.meridianScore-a.meridianScore||a.rank-b.rank);
  return ranked.map((result,index)=>({...result,meridianRank:index+1}));
}

export function sourceAwareQuery(plan:SearchQueryPlan){
  if(["FIND_REGULATION","FIND_REGULATORY_CLASSIFICATION","FIND_STANDARDS"].includes(plan.intent))return `${plan.query} (site:nmpa.gov.cn OR site:cmde.org.cn OR site:samr.gov.cn OR site:gov.cn)`;
  if(plan.intent==="FIND_TENDERS")return `${plan.query} (site:ccgp.gov.cn OR site:gov.cn)`;
  return plan.query;
}

