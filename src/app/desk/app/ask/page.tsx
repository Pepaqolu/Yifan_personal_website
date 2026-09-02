import Link from "next/link";
import { notFound } from "next/navigation";
import { AskForm } from "@/components/china-desk-app/ask-form";
import { PageHeader, formatDate } from "@/components/china-desk-app/ui";
import { requireWorkspace } from "@/lib/china-desk/auth";
import { createClient } from "@/lib/supabase/server";
import { archiveConversation, createAskChinaRequest, deleteConversation, renameConversation } from "./actions";
import type { AskChinaAnswer, SourceReference } from "@/lib/ai/types";

type Message = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  answer: AskChinaAnswer | null;
  source_references: SourceReference[];
  confidence: "HIGH" | "MEDIUM" | "LOW" | null;
  requires_local_execution: boolean;
  created_at: string;
};

function Answer({ message, question }: { message: Message; question: string }) {
  const answer = message.answer;
  if (!answer) return <p className="max-w-3xl leading-7 text-stone">{message.content}</p>;
  const needsResearch = answer.confidence === "LOW" || answer.missingInformation.length > 0;
  return (
    <div className="max-w-4xl">
      <p className="whitespace-pre-wrap text-lg leading-8">{answer.answer}</p>
      {answer.whatWeKnow.length ? (
        <section className="mt-10 border-t border-line pt-5">
          <p className="eyebrow text-stone">WHAT WE KNOW</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-stone">{answer.whatWeKnow.map((item) => <li key={item}>— {item}</li>)}</ul>
        </section>
      ) : null}
      {answer.assessment.length ? (
        <section className="mt-10 border-t border-line pt-5">
          <p className="eyebrow text-accent">CHINA DESK ASSESSMENT</p>
          <ul className="mt-4 space-y-3 text-sm leading-6">{answer.assessment.map((item) => <li key={item}>— {item}</li>)}</ul>
        </section>
      ) : null}
      {answer.missingInformation.length ? (
        <section className="mt-10 border-t border-line pt-5">
          <p className="eyebrow text-stone">MISSING INFORMATION</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-stone">{answer.missingInformation.map((item) => <li key={item}>— {item}</li>)}</ul>
        </section>
      ) : null}
      {message.source_references.length ? (
        <section className="mt-10 border-t border-line pt-5">
          <p className="eyebrow text-stone">SOURCES</p>
          <ul className="mt-4 space-y-2 text-sm">{message.source_references.map((source) => <li key={source.key}><span className="text-stone">{source.kind.replaceAll("_", " ")}:</span> {source.sourceUrl ? <a href={source.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-4">{source.sourceName || source.title}</a> : source.title}</li>)}</ul>
        </section>
      ) : null}
      <div className="mt-10 flex flex-wrap gap-6 border-t border-line pt-5">
        {needsResearch ? (
          <form action={createAskChinaRequest}>
            <input type="hidden" name="question" value={question} />
            <input type="hidden" name="title" value={answer.suggestedRequestTitle} />
            <input type="hidden" name="request_type" value={answer.suggestedRequestType} />
            <button className="border-b border-ink/25 pb-1 text-sm font-medium">Research this →</button>
          </form>
        ) : null}
        {answer.requiresLocalExecution ? (
          <form action={createAskChinaRequest}>
            <input type="hidden" name="question" value={question} />
            <input type="hidden" name="title" value={`China-side action: ${question.slice(0, 110)}`} />
            <input type="hidden" name="request_type" value="Contact someone" />
            <input type="hidden" name="local_execution" value="true" />
            <button className="border-b border-accent/40 pb-1 text-sm font-medium">Request China-side action →</button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export default async function AskChinaPage({ searchParams }: { searchParams: Promise<{ conversation?: string }> }) {
  const context = await requireWorkspace();
  if (!context.organization) notFound();
  const supabase = await createClient();
  const { conversation: selectedId } = await searchParams;
  const { data: conversations } = await supabase
    .from("ai_conversations")
    .select("id,title,status,updated_at")
    .eq("organization_id", context.organization.id)
    .eq("user_id", context.user.id)
    .order("updated_at", { ascending: false })
    .limit(20);
  const selected = selectedId ? conversations?.find((item) => item.id === selectedId) : null;
  if (selectedId && !selected) notFound();
  const { data: rawMessages } = selected
    ? await supabase.from("ai_messages").select("id,role,content,answer,source_references,confidence,requires_local_execution,created_at").eq("conversation_id", selected.id).order("created_at")
    : { data: [] };
  const messages = (rawMessages || []) as Message[];

  return (
    <>
      <PageHeader eyebrow="ASK CHINA" title={selected ? selected.title : "Ask your China Desk anything."} description="Answers grounded in your company context, accumulated research, partners, competitors, and market record." action={selected ? <Link href="/desk/app/ask" className="text-xs text-stone">New conversation →</Link> : undefined} />
      <div className="grid gap-16 xl:grid-cols-12">
        <aside className="xl:col-span-3">
          <p className="eyebrow text-stone">RECENT CONVERSATIONS</p>
          <div className="mt-5 border-t border-line">
            {(conversations || []).length ? conversations?.map((conversation) => (
              <Link key={conversation.id} href={`/desk/app/ask?conversation=${conversation.id}`} className={`block border-b border-line py-4 text-sm ${conversation.id === selectedId ? "font-medium" : "text-stone"}`}>
                {conversation.title}<span className="mt-1 block text-[0.65rem] font-normal text-stone">{formatDate(conversation.updated_at)}</span>
              </Link>
            )) : <p className="py-5 text-sm text-stone">Your questions will gather here.</p>}
          </div>
        </aside>
        <section className="xl:col-span-8 xl:col-start-5">
          {selected ? (
            <>
              <div className="mb-12 flex flex-wrap gap-5 border-b border-line pb-5 text-xs text-stone">
                <form action={renameConversation} className="flex gap-2"><input type="hidden" name="id" value={selected.id} /><input name="title" defaultValue={selected.title} aria-label="Conversation title" className="border-b border-line bg-transparent pb-1 outline-none" /><button>Rename</button></form>
                <form action={archiveConversation}><input type="hidden" name="id" value={selected.id} /><button>Archive</button></form>
                <form action={deleteConversation}><input type="hidden" name="id" value={selected.id} /><button>Delete</button></form>
              </div>
              <div className="space-y-14">
                {messages.map((message, index) => {
                  const previousQuestion = [...messages.slice(0, index)].reverse().find((item) => item.role === "USER")?.content || "";
                  return <article key={message.id} className={message.role === "USER" ? "border-l border-line pl-5" : ""}><p className="eyebrow text-stone">{message.role === "USER" ? "YOU" : `CHINA DESK · ${message.confidence || "LOW"} CONFIDENCE`}</p><div className="mt-5">{message.role === "ASSISTANT" ? <Answer message={message} question={previousQuestion} /> : <p className="text-xl leading-8">{message.content}</p>}</div></article>;
                })}
                {messages.at(-1)?.role === "USER" ? <p className="border-t border-line pt-6 text-sm text-stone">China Desk is reviewing this response.</p> : null}
              </div>
              <div className="mt-20 border-t border-line pt-8"><AskForm conversationId={selected.id} /></div>
            </>
          ) : <AskForm />}
        </section>
      </div>
    </>
  );
}
