"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { askChina, type AskState } from "@/app/desk/app/ask/actions";

const initialState: AskState = { message: "" };

export function AskForm({ conversationId }: { conversationId?: string }) {
  const [state, action, pending] = useActionState(askChina, initialState);
  const [question, setQuestion] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!state.success || !state.conversationId) return;
    router.push(`/desk/app/ask?conversation=${state.conversationId}`);
    router.refresh();
  }, [router, state.conversationId, state.success]);

  const suggestions = [
    "Who are our strongest Chinese competitors?",
    "What changed in our market recently?",
    "Which partners look most promising?",
    "What do we know about this company?",
    "How should we think about our pricing in China?",
    "What assumptions in our current strategy look weak?",
  ];

  return (
    <div>
      <form action={action}>
        <input type="hidden" name="conversation_id" value={conversationId || ""} />
        <label htmlFor="ask-china-question" className="sr-only">Ask your China Desk anything</label>
        <textarea
          id="ask-china-question"
          name="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          maxLength={800}
          required
          placeholder="Ask your China Desk anything."
          className="w-full resize-none border-b border-ink/20 bg-transparent pb-6 text-[clamp(2rem,5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.06em] outline-none placeholder:text-stone/35"
        />
        <div className="mt-6 flex items-center justify-between gap-6">
          <p aria-live="polite" className={`text-xs leading-5 ${state.success ? "text-stone" : "text-accent"}`}>{state.message}</p>
          <button disabled={pending || question.trim().length < 5} className="shrink-0 border-b border-ink/25 pb-1.5 text-sm font-medium disabled:opacity-40">
            {pending ? "Reviewing context…" : "Ask China →"}
          </button>
        </div>
      </form>
      {!conversationId ? (
        <div className="mt-16 border-t border-line pt-6">
          <p className="eyebrow text-stone">SUGGESTED QUESTIONS</p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setQuestion(suggestion)} className="text-left text-sm text-stone transition-colors hover:text-ink">
                {suggestion} →
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
