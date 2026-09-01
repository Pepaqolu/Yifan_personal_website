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
  if (context) redirect(context.profile.role === "ADMIN" ? "/admin" : "/desk/app");

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="page-shell flex min-h-screen flex-col py-8 sm:py-12">
        <header className="flex items-center justify-between"><Link href="/" className="text-xs font-semibold">YF</Link><Link href="/desk" className="eyebrow text-stone">China Desk</Link></header>
        <section className="my-auto grid gap-16 py-24 md:grid-cols-12">
          <div className="md:col-span-6"><p className="eyebrow text-accent">PRIVATE BETA</p><h1 className="mt-8 text-[clamp(4rem,9vw,9rem)] font-medium leading-[0.86] tracking-[-0.075em]">Your China Desk.</h1></div>
          <div className="md:col-span-4 md:col-start-9 md:self-end"><p className="text-lg leading-7 text-stone">Invite-only access for China Desk clients.</p><AuthForm action={signIn} mode="signin" /><Link href="/desk/login/reset" className="mt-8 inline-block text-xs text-stone hover:text-ink">Forgot your password?</Link></div>
        </section>
        <footer className="border-t border-line pt-5 text-xs text-stone">Need access? <a className="text-ink" href="mailto:yifanevanfu@gmail.com?subject=China%20Desk%20Private%20Beta">Contact Yifan →</a></footer>
      </div>
    </main>
  );
}
