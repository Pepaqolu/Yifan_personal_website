import "server-only";
import type {
  AIProvider,
  AIResult,
  AskChinaAnswer,
  CompetitorAssessment,
  MarketPulseDraft,
  PartnerAssessment,
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
}

export function getAIProvider(): AIProvider {
  return process.env.AI_PROVIDER === "fixture" ? new FixtureProvider() : new OpenAIProvider();
}
