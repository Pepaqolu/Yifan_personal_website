import "server-only";
import type {
  AIProvider,
  AIResult,
  AskChinaAnswer,
  CompetitorAssessment,
  MarketPulseDraft,
  PartnerAssessment,
  OpportunitySnapshot,
  ResearchDraft,
} from "./types";

const MAX_PROVIDER_INPUT = 24_000;

function configuredModel() {
  return process.env.OPENAI_MODEL || "gpt-5-mini";
}

function outputText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") return payload.output_text;
  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as { content?: unknown }).content)
      ? (item as { content: unknown[] }).content
      : [];
    for (const part of content) {
      if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") {
        return (part as { text: string }).text;
      }
    }
  }
  throw new Error("The AI provider returned no readable response.");
}

class OpenAIProvider implements AIProvider {
  private async structured<T>(name: string, instructions: string, input: string): Promise<AIResult<T>> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("Ask Meridian is not configured yet.");
    if (input.length > MAX_PROVIDER_INPUT) throw new Error("The intelligence context exceeded the safe prompt limit.");

    const model = configuredModel();
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        instructions,
        input,
        max_output_tokens: 1800,
        text: { format: { type: "json_object" } },
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`AI provider error (${response.status}): ${detail.slice(0, 240)}`);
    }
    const payload = (await response.json()) as Record<string, unknown>;
    const parsed = JSON.parse(outputText(payload)) as T;
    const rawUsage = (payload.usage || {}) as Record<string, unknown>;
    const inputTokens = Number(rawUsage.input_tokens || 0);
    const outputTokens = Number(rawUsage.output_tokens || 0);
    return {
      value: parsed,
      model,
      usage: { inputTokens, outputTokens, totalTokens: Number(rawUsage.total_tokens || inputTokens + outputTokens) },
    };
  }

  generateAnswer({ question, evidence, history }: Parameters<AIProvider["generateAnswer"]>[0]) {
    return this.structured<AskChinaAnswer>(
      "ask_china_answer",
      `You are Meridian, an evidence-led China market intelligence assistant. Use ONLY the supplied client evidence and conversation history. Never add facts from memory. Separate stored facts from assessment. If evidence is weak, say so and use LOW confidence. sourceKeys must contain only supplied evidence keys. Mark work requiring outreach, WeChat, factory contact, qualification, verification, regulatory confirmation, negotiation, inspection, or live local checks as requiresLocalExecution. Return JSON with: answer (string), whatWeKnow (string[]), assessment (string[]), missingInformation (string[]), sourceKeys (string[]), confidence (HIGH|MEDIUM|LOW), requiresLocalExecution (boolean), localExecutionReason (string), suggestedRequestTitle (string), suggestedRequestType (one of Research a company|Find partners|Find suppliers|Check a competitor|Validate an assumption|Market question|Contact someone|Other).`,
      JSON.stringify({ question, evidence, recentConversation: history }),
    );
  }

  summarizeResearch({ material, clientContext }: Parameters<AIProvider["summarizeResearch"]>[0]) {
    return this.structured<ResearchDraft>(
      "research_draft",
      "Create a factual research draft using only the supplied material and client context. Do not invent companies or findings. Return JSON: title, summary, keyFindings[], implications[], companiesMentioned[], potentialCompetitors[], potentialPartners[], tags[], followUpQuestions[].",
      JSON.stringify({ material, clientContext }),
    );
  }

  generateMarketPulse({ material, clientContext }: Parameters<AIProvider["generateMarketPulse"]>[0]) {
    return this.structured<MarketPulseDraft>(
      "market_pulse_draft",
      "Draft one client-specific Market Pulse item using only supplied material. Return JSON: headline, summary (2-4 sentences), category (Market|Competitor|Regulation|Pricing|Partner|Customer|Other), whyItMatters, priority (LOW|MEDIUM|HIGH|URGENT), recommendedAction. Do not invent missing facts.",
      JSON.stringify({ material, clientContext }),
    );
  }

  analyzeCompetitor({ facts, clientContext }: Parameters<AIProvider["analyzeCompetitor"]>[0]) {
    return this.structured<CompetitorAssessment>(
      "competitor_assessment",
      "Assess the competitor only from supplied database facts and client context. Explicitly capture limitations. Return JSON: positioning, strengths[], weaknesses[], recentActivity, potentialThreat, questionsToInvestigate[], evidenceLimitations[].",
      JSON.stringify({ facts, clientContext }),
    );
  }

  analyzePartner({ facts, clientContext }: Parameters<AIProvider["analyzePartner"]>[0]) {
    return this.structured<PartnerAssessment>(
      "partner_assessment",
      "Assess partner fit only from supplied partner facts and client requirements. Never change pipeline status. Return JSON: fit (HIGH|MEDIUM|LOW|UNKNOWN), rationale, concerns[], questionsToVerify[], recommendedNextAction, evidenceLimitations[].",
      JSON.stringify({ facts, clientContext }),
    );
  }

  generateOpportunitySnapshot(input: Parameters<AIProvider["generateOpportunitySnapshot"]>[0]) {
    return this.structured<OpportunitySnapshot>(
      "meridian_opportunity_snapshot",
      `Create a concise, genuinely useful China Opportunity Snapshot from ONLY the user input and supplied retrieved webpage text. Do not use memory or invent named companies, market sizes, pricing, tenders, regulations, certifications, contacts, revenue, sources or claims. Information directly stated by the user or retrieved page may appear under verifiedInformation, with cautious wording. Everything else is a Meridian assessment or a question to validate. If evidence is absent, say so. Adapt for sourcing when Suppliers is selected; do not assume selling into China. Chinese search terms must be practical translations/search constructions based on the supplied product, buyer and industry, never fabricated entities. Scores are directional assessments, not scientific metrics. Return JSON exactly with: mode (MARKET_ENTRY|SOURCING|HYBRID); companyUnderstanding {company,product,summary,likelyBuyer}; verifiedInformation string[]; opportunityScore {total integer 0-100,label,factors[{label,score integer 0-100,rationale}]}; bestFitBuyerTypes[{type,why}]; competitiveLandscape string[]; chineseSearchStrategy[{category,terms string[]}]; keyRisks[{risk,why}]; recommendedActions[{action,why}]; optional sourcing {likelyRegions string[],supplierArchetypes string[],moqConsiderations string[],dueDiligenceChecklist string[]}; questionsToValidate string[]; limitations string[]. Include 4-5 score factors, 3-5 buyer types, 3-5 landscape observations, 3-5 search categories, 4-6 risks, exactly 5 actions and 3-6 validation questions. Keep each item short and specific.`,
      JSON.stringify(input),
    );
  }
}

function fixtureResult<T>(value: T): AIResult<T> {
  return { value, model: "fixture", usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } };
}

class FixtureProvider extends OpenAIProvider {
  generateAnswer({ question, evidence }: Parameters<AIProvider["generateAnswer"]>[0]) {
    const enough = evidence.length >= 3 && !/unknown company|live outreach/i.test(question);
    return Promise.resolve(fixtureResult<AskChinaAnswer>({
      answer: enough
        ? "Stored client evidence points to partner qualification and pricing validation as the immediate priorities."
        : "We don't have enough client-specific evidence to answer this confidently yet.",
      whatWeKnow: evidence.slice(0, 2).map((item) => item.content.slice(0, 160)),
      assessment: enough ? ["This is a fictional development assessment based only on the records listed below."] : [],
      missingInformation: enough ? [] : ["Current, client-specific evidence for this question"],
      sourceKeys: evidence.slice(0, 3).map((item) => item.key),
      confidence: enough ? "MEDIUM" : "LOW",
      requiresLocalExecution: /outreach|wechat|factory|contact/i.test(question),
      localExecutionReason: /outreach|wechat|factory|contact/i.test(question) ? "This requires current China-side contact or verification." : "",
      suggestedRequestTitle: `Research: ${question.slice(0, 120)}`,
      suggestedRequestType: /contact|outreach|wechat/i.test(question) ? "Contact someone" : "Market question",
    }));
  }

  summarizeResearch() {
    return Promise.resolve(fixtureResult<ResearchDraft>({ title: "Fictional research draft", summary: "A draft generated from fictional development material.", keyFindings: ["One illustrative finding"], implications: ["Validate before client publication"], companiesMentioned: [], potentialCompetitors: [], potentialPartners: [], tags: ["fixture"], followUpQuestions: ["What evidence should be verified next?"] }));
  }
  generateMarketPulse() {
    return Promise.resolve(fixtureResult<MarketPulseDraft>({ headline: "Fictional market development", summary: "Illustrative development material suggests a change worth validating.", category: "Market", whyItMatters: "It may affect an existing assumption.", priority: "MEDIUM", recommendedAction: "Validate the source before publishing." }));
  }
  analyzeCompetitor() {
    return Promise.resolve(fixtureResult<CompetitorAssessment>({ positioning: "Based on stored fictional positioning.", strengths: ["Local responsiveness"], weaknesses: [], recentActivity: "No verified current activity.", potentialThreat: "Unknown until evidence is expanded.", questionsToInvestigate: ["Validate current pricing"], evidenceLimitations: ["Development fixture only"] }));
  }
  analyzePartner() {
    return Promise.resolve(fixtureResult<PartnerAssessment>({ fit: "UNKNOWN", rationale: "The stored fictional profile is incomplete.", concerns: ["Qualification evidence is limited"], questionsToVerify: ["Confirm coverage and references"], recommendedNextAction: "Run a structured qualification call.", evidenceLimitations: ["Development fixture only"] }));
  }
  generateOpportunitySnapshot(input: Parameters<AIProvider["generateOpportunitySnapshot"]>[0]) {
    const sourcing = input.goals.includes("Suppliers");
    const hybrid = sourcing && input.goals.some((goal) => goal !== "Suppliers");
    const subject = input.productDescription || input.retrievedPage?.title || "the supplied product";
    const buyerTypes = [...input.targetBuyers, input.targetBuyerCustom].filter(Boolean).slice(0, 4);
    return Promise.resolve(fixtureResult<OpportunitySnapshot>({
      mode: hybrid ? "HYBRID" : sourcing ? "SOURCING" : "MARKET_ENTRY",
      companyUnderstanding: { company: input.companyName || "Company name not supplied", product: subject.slice(0, 180), summary: `The analysis is based on the supplied ${input.industry} product context and stated China objectives.`, likelyBuyer: [...input.targetBuyers, input.targetBuyerCustom].filter(Boolean).join(", ") || "Buyer type requires validation" },
      verifiedInformation: [input.productDescription ? `User supplied: ${input.productDescription.slice(0, 240)}` : "No product description was supplied."],
      opportunityScore: { total: 68, label: "POTENTIAL — VALIDATION NEEDED", factors: [
        { label: "Market relevance", score: 72, rationale: "The selected industry and China objective indicate a plausible use case; demand is not yet verified." },
        { label: "Buyer clarity", score: input.targetBuyers.length ? 76 : 48, rationale: input.targetBuyers.length ? "Target buyer categories were supplied." : "A specific buyer still needs to be defined." },
        { label: "Competition visibility", score: 52, rationale: "No verified competitor dataset is connected to this snapshot." },
        { label: sourcing ? "Supplier feasibility" : "Distribution feasibility", score: 66, rationale: "The route is assessable, but named organizations and commercial terms require research." },
        { label: "China readiness", score: input.chinaStatus.includes("Already") ? 78 : 56, rationale: `Readiness is inferred only from the stated status: ${input.chinaStatus}.` },
      ]},
      bestFitBuyerTypes: buyerTypes.map((type) => ({ type, why: "Selected by the user; validate purchasing authority, product fit and geography." })),
      competitiveLandscape: ["Domestic alternatives and international brands should be mapped before positioning decisions.", "Pricing pressure and local substitutes require evidence from current Chinese-language sources.", "No named competitors have been verified in this snapshot."],
      chineseSearchStrategy: [
        { category: "Product", terms: [`${input.industry} 产品`, `${input.industry} 供应商`] },
        { category: sourcing ? "Supplier discovery" : "Channel discovery", terms: sourcing ? ["生产厂家", "工厂 认证", "源头厂家"] : ["经销商", "代理商", "采购"] },
        { category: "Commercial signals", terms: ["招标", "中标", "采购公告"] },
      ],
      keyRisks: [
        { risk: "Evidence coverage", why: "Current named companies and live market activity are not verified." },
        { risk: sourcing ? "Factory qualification" : "Channel fit", why: sourcing ? "Factory status, quality systems and certifications require direct verification." : "Portfolio overlap, coverage and buyer access require verification." },
        { risk: "Localization", why: "Chinese terminology, claims and buyer expectations need market testing." },
        { risk: "Commercial assumptions", why: "Pricing, lead times and procurement pathways have not been validated." },
      ],
      recommendedActions: [
        { action: "Confirm the product classification and required evidence", why: "This sets the boundary for research and verification." },
        { action: "Refine the Chinese product and buyer vocabulary", why: "Accurate search terms improve company and signal discovery." },
        { action: sourcing ? "Map two relevant manufacturing clusters" : "Map two priority buyer or distributor regions", why: "A focused geography makes qualification practical." },
        { action: "Build a verified longlist using Chinese-language sources", why: "Named opportunities should come from evidence, not model memory." },
        { action: sourcing ? "Run a factory-versus-trader due-diligence pass" : "Validate five candidates against product, coverage and portfolio fit", why: "This converts hypotheses into actionable opportunities." },
      ],
      sourcing: sourcing ? { likelyRegions: ["Manufacturing regions require product-specific research before naming them."], supplierArchetypes: ["Direct manufacturer", "Specialist contract manufacturer", "Trading company requiring disclosure"], moqConsiderations: ["Request tiered MOQ, sample and tooling terms."], dueDiligenceChecklist: ["Business registration", "Factory address", "Quality system", "Relevant certifications", "Production capability", "Reference customers"] } : undefined,
      questionsToValidate: ["Which product specification is non-negotiable?", "Which Chinese regions matter first?", "What commercial threshold defines a qualified opportunity?"],
      limitations: ["Development fallback: no live web or proprietary market dataset was used.", "No named company, price, tender or regulation has been verified."],
    }));
  }
}

export function getAIProvider(): AIProvider {
  return process.env.AI_PROVIDER === "fixture" ? new FixtureProvider() : new OpenAIProvider();
}
