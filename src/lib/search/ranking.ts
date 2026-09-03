import { classifySource } from "@/lib/meridian-intelligence/retrieval";
import { SourceCredibilityService } from "@/lib/intelligence/source-credibility";
import { scoreSearchQuality } from "@/lib/intelligence/scoring";
import type { ProviderSearchResult, RankedSearchResult, SearchQueryPlan } from "./types";

function tokens(value:string){const lower=value.toLowerCase();const latin=lower.match(/[a-z0-9]{2,}/g)||[];const han=lower.match(/[\u3400-\u9fff]+/g)?.flatMap((group)=>group.length<3?[group]:Array.from({length:group.length-1},(_,i)=>group.slice(i,i+2)))||[];return[...new Set([...latin,...han])].slice(0,50);}
function overlap(needles:string[],text:string){if(!needles.length)return 0;return needles.filter((token)=>text.includes(token)).length/needles.length;}
function ageScore(value:string|null){if(!value)return 45;const date=new Date(value);if(Number.isNaN(date.getTime()))return 35;const days=(Date.now()-date.getTime())/86400000;return days<90?100:days<365?80:days<1095?55:25;}
function key(value:string){return value.toLowerCase().replace(/^https?:\/\/(www\.)?/,"").replace(/[?#].*$/,"").replace(/\/$/,"");}

export function rankSearchResults(plan:SearchQueryPlan,results:ProviderSearchResult[]):RankedSearchResult[]{
  const queryTokens=tokens(`${plan.query} ${plan.product_terms.join(" ")}`);const credibility=new SourceCredibilityService();const seen=new Set<string>();
  const unique=results.filter((result)=>{const normalized=key(result.url);if(seen.has(normalized))return false;seen.add(normalized);return true;});
  const ranked=unique.map((result)=>{const classification=classifySource(result.url);const haystack=`${result.title} ${result.snippet} ${result.domain}`.toLowerCase();const relevance=Math.round(overlap(queryTokens,haystack)*100);let intent=relevance;
    if(plan.intent.startsWith("FIND_REG")||plan.intent==="FIND_STANDARDS")intent=classification.sourceType==="AUTHORITATIVE"?100:20;
    if(plan.intent==="FIND_TENDERS")intent=/采购|招标|中标|tender|procurement|award/i.test(haystack)?100:30;
    if(["DISCOVER_DISTRIBUTORS","DISCOVER_PARTNERS"].includes(plan.intent))intent=/经销|代理|合作|产品|distributor|partner/i.test(haystack)?90:35;
    if(plan.intent==="DISCOVER_CUSTOMERS")intent=/采购|客户|买家|buyer|customer|procurement/i.test(haystack)?90:35;
    const source=credibility.assess({url:result.url,sourceType:classification.sourceType,intent:plan.intent,hasClearOwnership:Boolean(result.domain),isStale:ageScore(result.publishedAt)<40});
    const specificity=Math.min(100,Math.round(relevance*.75+(result.title.length>16?25:10)));const actionability=Math.min(100,Math.round(intent*.75+(/contact|联系我们|招标|采购|经销|代理/i.test(haystack)?25:5)));const traceability=result.url&&result.title&&result.domain?100:result.url?60:20;const freshness=ageScore(result.publishedAt);const differentiation=Math.max(20,100-(result.rank-1)*6);
    const breakdown={intentRelevance:Math.max(relevance,intent),sourceCredibility:source.score,specificity,actionability,evidenceTraceability:traceability,freshness,differentiation};const scored=scoreSearchQuality(breakdown);const reasons=[`Intent relevance ${breakdown.intentRelevance}/100`,`Source credibility ${source.score}/100`,`Traceability ${traceability}/100`,...source.limitations];
    return{...result,sourceType:classification.sourceType,sourceAuthority:classification.authorityLevel,meridianScore:scored.score,meridianRank:0,rankingReasons:reasons,scoreBreakdown:breakdown,eligibleForClient:scored.eligible,duplicateGroupKey:key(result.url),independentSourceKey:result.domain.toLowerCase()};}).sort((a,b)=>b.meridianScore-a.meridianScore||a.rank-b.rank);
  return ranked.map((result,index)=>({...result,meridianRank:index+1}));
}

export function sourceAwareQuery(plan:SearchQueryPlan){
  if(["FIND_REGULATION","FIND_REGULATORY_CLASSIFICATION","FIND_STANDARDS"].includes(plan.intent))return `${plan.query} (site:nmpa.gov.cn OR site:cmde.org.cn OR site:samr.gov.cn OR site:gov.cn)`;
  if(plan.intent==="FIND_TENDERS")return `${plan.query} (site:ccgp.gov.cn OR site:gov.cn)`;
  return plan.query;
}
