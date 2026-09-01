import { AuthForm } from "@/components/auth-form";
import { updatePassword } from "../actions";

export const dynamic = "force-dynamic";
export default function UpdatePasswordPage() {
  return <main className="min-h-screen bg-paper"><div className="page-shell flex min-h-screen items-center"><section className="w-full max-w-xl py-24"><p className="eyebrow text-accent">SECURE ACCOUNT</p><h1 className="mt-8 text-[clamp(3.5rem,8vw,7rem)] font-medium leading-[0.88] tracking-[-0.07em]">Choose a new password.</h1><AuthForm action={updatePassword} mode="update" /></section></div></main>;
}
