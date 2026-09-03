export type EvidenceSuggestion={text:string;reason:string;status:"SUGGESTED"};
export interface EvidenceExtractionProvider{suggest(input:{content:string;query:string;productTerms:string[]}):Promise<EvidenceSuggestion[]>;}

function terms(value:string){return [...new Set((value.match(/[\u3400-\u9fff]{2,}|[a-zA-Z0-9]{3,}/g)||[]).map((item)=>item.toLowerCase()))].slice(0,30);}
export class DeterministicEvidenceExtractor implements EvidenceExtractionProvider{
  async suggest({content,query,productTerms}:{content:string;query:string;productTerms:string[]}){const needles=terms(`${query} ${productTerms.join(" ")}`);const sentences=content.split(/(?<=[。！？.!?])\s*/).map((item)=>item.trim()).filter((item)=>item.length>=30&&item.length<=500);const ranked=sentences.map((text)=>({text,score:needles.reduce((sum,needle)=>sum+(text.toLowerCase().includes(needle)?1:0),0)})).sort((a,b)=>b.score-a.score);const best=ranked.find((item)=>item.score>0);return best?[{text:best.text,reason:"Contains terms from the selected query and product profile.",status:"SUGGESTED" as const}]:[];}
}

