import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { signIn } from "./actions";
import { getWorkspaceContext } from "@/lib/china-desk/auth";

export const metadata: Metadata = { title: "Sign in — China Desk", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const context = await getWorkspaceContext();
  if (context) {
    if (context.profile.role === "ADMIN") redirect("/admin");
    redirect(context.organization?.onboarding_completed_at || context.organization?.onboarding_skipped_at ? "/desk/app" : "/desk/app/onboarding");
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="page-shell flex min-h-screen flex-col py-8 sm:py-12">
        <header>
          <Link href="/desk" className="eyebrow text-stone">China Desk</Link>
        </header>
        <section className="my-auto w-full max-w-md py-24">
          <p className="eyebrow text-stone">CHINA DESK</p>
          <h1 className="mt-8 text-[clamp(3.75rem,8vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.07em]">Welcome back.</h1>
          <AuthForm action={signIn} mode="signin" />
          <Link href="/desk/login/reset" className="mt-8 inline-block text-xs text-stone transition-colors hover:text-ink">Forgot password?</Link>
        </section>
        <footer className="border-t border-line pt-5 text-xs text-stone">
          Need access? <a className="text-ink transition-colors hover:text-accent" href="mailto:yifanevanfu@gmail.com?subject=China%20Desk%20Private%20Beta">Request private access →</a>
        </footer>
      </div>
    </main>
  );
}
