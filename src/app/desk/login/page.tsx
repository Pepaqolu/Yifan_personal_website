import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { signIn } from "./actions";
import { getWorkspaceContext } from "@/lib/china-desk/auth";
import { productConfig } from "@/config/productConfig";
import { MeridianBrand } from "@/components/meridian-brand";

export const metadata: Metadata = { title: `Sign in — ${productConfig.name}`, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const context = await getWorkspaceContext();
  if (context) {
    if (context.profile.role === "ADMIN") redirect("/admin");
    redirect(context.organization?.onboarding_completed_at || context.organization?.onboarding_skipped_at ? "/meridian/app" : "/meridian/app/onboarding");
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="page-shell flex min-h-screen flex-col py-8 sm:py-12">
        <header>
          <Link href="/" className="text-[0.62rem] text-stone"><MeridianBrand compact /></Link>
        </header>
        <section className="my-auto w-full max-w-md py-24">
          <p className="eyebrow text-accent">{productConfig.shortName.toUpperCase()}</p>
          <h1 className="mt-8 text-[clamp(3.75rem,8vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.07em]">Welcome back.</h1>
          <AuthForm action={signIn} mode="signin" />
          <Link href="/meridian/login/reset" className="mt-8 inline-block text-xs text-stone transition-colors hover:text-ink">Forgot password?</Link>
        </section>
        <footer className="border-t border-line pt-5 text-xs text-stone">
          Need access? <Link className="text-ink transition-colors hover:text-accent" href={productConfig.routes.analyze}>Analyze your China opportunity →</Link>
        </footer>
      </div>
    </main>
  );
}
