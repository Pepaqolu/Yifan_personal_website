import { intelligenceConfig, type SourceCredibilityKind } from "@/config/intelligenceConfig";

export type CredibilityContext = {
  url: string;
  sourceType?: string;
  intent?: string;
  hasPrimaryEvidence?: boolean;
  hasClearOwnership?: boolean;
  isStale?: boolean;
  isSyndicated?: boolean;
  conflictsWithStrongerEvidence?: boolean;
  independentCorroboration?: number;
};

export type CredibilityAssessment = {
  kind: SourceCredibilityKind;
  score: number;
  reasons: string[];
  limitations: string[];
};

const regulatorDomains = ["nmpa.gov.cn", "cmde.org.cn", "samr.gov.cn", "miit.gov.cn", "cac.gov.cn", "customs.gov.cn", "gov.cn"];
const procurementDomains = ["ccgp.gov.cn", "zfcg.gov.cn"];
const registryDomains = ["gsxt.gov.cn", "creditchina.gov.cn"];
const marketplaces = ["1688.com", "alibaba.com", "tmall.com", "jd.com"];
const socialDomains = ["weixin.qq.com", "weibo.com", "xiaohongshu.com", "douyin.com"];

function hostname(url: string) {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ""); }
  catch { return ""; }
}
function matches(domain: string, candidates: string[]) { return candidates.some((item) => domain === item || domain.endsWith(`.${item}`)); }
function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }

export class SourceCredibilityService {
  classify(input: CredibilityContext): SourceCredibilityKind {
    const domain = hostname(input.url);
    if (matches(domain, procurementDomains)) return "GOVERNMENT_PROCUREMENT";
    if (matches(domain, registryDomains)) return "OFFICIAL_REGISTRY";
    if (matches(domain, regulatorDomains) || domain.endsWith(".gov.cn")) return "REGULATOR_PRIMARY";
    if (matches(domain, marketplaces)) return "MARKETPLACE";
    if (matches(domain, socialDomains)) return "OFFICIAL_SOCIAL";
    if (input.sourceType === "AUTHORITATIVE") return "OFFICIAL_REGISTRY";
    if (input.sourceType === "COMMERCIAL" && domain) return "OFFICIAL_COMPANY";
    if (input.sourceType === "MARKET" && domain) return "INDUSTRY_MEDIA";
    return "UNKNOWN_DIRECTORY";
  }

  assess(input: CredibilityContext): CredibilityAssessment {
    const kind = this.classify(input);
    let score: number = intelligenceConfig.sourceCredibilityDefaults[kind];
    const reasons = [`${kind.replaceAll("_", " ").toLowerCase()} baseline`];
    const limitations: string[] = [];
    if ((input.independentCorroboration ?? 0) >= 2) { const bonus = Math.min(15, 5 + (input.independentCorroboration! - 2) * 3); score += bonus; reasons.push(`${input.independentCorroboration} independent sources corroborate`); }
    if (input.hasPrimaryEvidence) { score += 5; reasons.push("primary underlying evidence available"); }
    if (input.hasClearOwnership) { score += 5; reasons.push("clear organization and ownership"); }
    if (input.isStale) { score -= 12; limitations.push("time-sensitive claim may be stale"); }
    if (input.isSyndicated) { score -= 5; limitations.push("repeated or syndicated source"); }
    if (input.conflictsWithStrongerEvidence) { score -= 20; limitations.push("conflicts with materially stronger evidence"); }
    if (!hostname(input.url)) { score -= 10; limitations.push("source identity cannot be checked"); }
    if (kind === "MARKETPLACE" && /regulat|license|certif|factory verification/i.test(input.intent || "")) limitations.push("marketplace evidence is insufficient for this claim type");
    return { kind, score: clamp(score), reasons, limitations };
  }
}
