"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { askChina, type AskState } from "@/app/desk/app/ask/actions";
import { productConfig } from "@/config/productConfig";

const initialState: AskState = { message: "" };

export function AskForm({ conversationId }: { conversationId?: string }) {
  const [state, action, pending] = useActionState(askChina, initialState);
  const [question, setQuestion] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!state.success || !state.conversationId) return;
    router.push(`/meridian/app/ask?conversation=${state.conversationId}`);
    router.refresh();
  }, [router, state.conversationId, state.success]);

  const suggestions = [
    "Who are our strongest potential distributors?",
    "What changed in our market recently?",
    "Which companies should we contact first?",
    "What do we know about this company?",
    "Who competes most directly with us?",
    "What should our first China move be?",
  ];

  return (
    <div>
      <form action={action} className="rounded-[20px] border border-line bg-elevated p-5 shadow-[var(--shadow-elevated)] sm:p-7">
        <input type="hidden" name="conversation_id" value={conversationId || ""} />
        <label htmlFor="ask-china-question" className="sr-only">Ask {productConfig.shortName} about your China market</label>
        <textarea
          id="ask-china-question"
          name="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          maxLength={800}
          required
          placeholder={`Ask ${productConfig.shortName} about your China market...`}
          className="command-input w-full resize-none text-[clamp(1.8rem,4vw,3.75rem)] font-medium leading-[1] tracking-[-0.055em] outline-none placeholder:text-stone/35"
        />
        <div className="mt-6 flex items-center justify-between gap-6">
          <p aria-live="polite" className={`text-xs leading-5 ${state.success ? "text-stone" : "text-accent"}`}>{state.message}</p>
          <button disabled={pending || question.trim().length < 5} className="shrink-0 rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-[#071018] transition-colors hover:bg-ice-bright disabled:opacity-40">
            {pending ? "Reviewing context…" : `Ask ${productConfig.shortName} →`}
          </button>
        </div>
      </form>
      {!conversationId ? (
        <div className="mt-16 border-t border-line pt-6">
          <p className="eyebrow text-stone">SUGGESTED QUESTIONS</p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setQuestion(suggestion)} className="rounded-lg border border-line bg-white/[0.018] px-3 py-2 text-left text-xs leading-5 text-stone transition-colors hover:border-ink/15 hover:text-ink sm:text-sm">
                {suggestion} →
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
