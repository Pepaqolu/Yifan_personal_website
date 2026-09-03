import { ProductProfileWizard } from "@/components/china-desk-app/product-profile-wizard";
import { requireWorkspace } from "@/lib/china-desk/auth";

export default async function OnboardingPage({searchParams}:{searchParams:Promise<{website?:string|string[]}>}) {
  await requireWorkspace();
  const raw=(await searchParams).website;
  const website=(Array.isArray(raw)?raw[0]:raw||"").slice(0,500);
  return <main className="mx-auto max-w-6xl py-8 sm:py-16">
    <p className="eyebrow text-accent">PRODUCT ONBOARDING</p>
    <h1 className="mt-8 max-w-[10ch] text-[clamp(3.5rem,8vw,7.5rem)] font-medium leading-[0.88] tracking-[-0.07em]">Start with what you sell.</h1>
    <p className="mt-8 max-w-xl leading-7 text-stone">Six short steps give Meridian enough context to prepare a private, China-specific research path.</p>
    <section className="mt-16 sm:mt-24"><ProductProfileWizard initial={null} initialUrl={website}/></section>
  </main>;
}
