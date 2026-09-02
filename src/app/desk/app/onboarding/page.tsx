import { completeOnboarding, skipOnboarding } from "./actions";

const prompts = [
  ["company", "What does your company do?", "A concise overview is enough."],
  ["products", "What are you bringing to China?", "Products, services, and the problems they solve."],
  ["goals", "What are your China goals?", "Validation, sales, sourcing, partnerships, or something else."],
  ["customers", "Who are your target customers?", "Customer types, buyers, and end users."],
  ["regions", "What regions matter?", "Cities, provinces, or broader geographic priorities."],
  ["partners", "Do you already have Chinese partners?", "What they do and where the relationship stands."],
  ["competitors", "Who do you consider competitors?", "Chinese, international, direct, or adjacent."],
  ["questions", "What are you trying to answer?", "The decisions or uncertainties that brought you here."],
] as const;

export default function OnboardingPage() {
  return (
    <main className="mx-auto max-w-5xl py-8 sm:py-16">
      <p className="eyebrow text-accent">FIRST CONTEXT</p>
      <h1 className="mt-8 max-w-[11ch] text-[clamp(3.5rem,8vw,7.5rem)] font-medium leading-[0.88] tracking-[-0.07em]">Help China Desk understand your company.</h1>
      <p className="mt-8 max-w-xl leading-7 text-stone">Answer what you can. This becomes private organization knowledge and improves every future Ask China response.</p>
      <form action={completeOnboarding} className="mt-20 border-t border-line">
        {prompts.map(([name, question, hint], index) => (
          <label key={name} className="grid gap-5 border-b border-line py-9 md:grid-cols-12">
            <span className="font-mono text-[0.62rem] text-stone md:col-span-1">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-xl font-medium tracking-[-0.035em] md:col-span-4">{question}<small className="mt-2 block text-xs font-normal leading-5 text-stone">{hint}</small></span>
            <textarea name={name} rows={3} className="resize-none border-b border-ink/15 bg-transparent pb-3 leading-7 outline-none md:col-span-6 md:col-start-7" />
          </label>
        ))}
        <div className="mt-10 flex items-center justify-between gap-8">
          <button className="border-b border-ink/25 pb-1.5 text-sm font-medium">Save company context →</button>
        </div>
      </form>
      <form action={skipOnboarding} className="mt-8"><button className="text-xs text-stone transition-colors hover:text-ink">Skip for now</button></form>
    </main>
  );
}
