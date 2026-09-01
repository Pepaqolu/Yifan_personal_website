import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { requestPasswordReset } from "../actions";

export const dynamic = "force-dynamic";
export default function ResetPage() {
  return <main className="min-h-screen bg-paper"><div className="page-shell flex min-h-screen flex-col py-8"><Link href="/desk/login" className="eyebrow text-stone">← Back to sign in</Link><section className="my-auto max-w-xl py-24"><p className="eyebrow text-accent">ACCOUNT RECOVERY</p><h1 className="mt-8 text-[clamp(3.5rem,8vw,7rem)] font-medium leading-[0.88] tracking-[-0.07em]">Reset your password.</h1><p className="mt-8 text-stone">We will send a secure reset link to an invited account.</p><AuthForm action={requestPasswordReset} mode="reset" /></section></div></main>;
}
