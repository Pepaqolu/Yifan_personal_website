"use client";

import { useActionState } from "react";
import type { AuthState } from "@/app/desk/login/actions";

const initialState: AuthState = { message: "" };

export function AuthForm({ action, mode }: { action: (state: AuthState, formData: FormData) => Promise<AuthState>; mode: "signin" | "reset" | "update" }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const isSignIn = mode === "signin";
  const isUpdate = mode === "update";

  return (
    <form action={formAction} className="mt-12 space-y-7">
      {!isUpdate ? (
        <label className="block border-b border-ink/20 pb-3">
          <span className="eyebrow text-stone">Email</span>
          <input name="email" type="email" required autoComplete="email" className="mt-3 w-full bg-transparent text-xl outline-none placeholder:text-stone/35" placeholder="you@company.com" />
        </label>
      ) : null}
      {isSignIn || isUpdate ? (
        <label className="block border-b border-ink/20 pb-3">
          <span className="eyebrow text-stone">{isUpdate ? "New password" : "Password"}</span>
          <input name="password" type="password" required minLength={isUpdate ? 10 : undefined} autoComplete={isUpdate ? "new-password" : "current-password"} className="mt-3 w-full bg-transparent text-xl outline-none placeholder:text-stone/35" placeholder="••••••••••" />
        </label>
      ) : null}
      {state.message ? <p aria-live="polite" className={`text-sm leading-6 ${state.success ? "text-stone" : "text-accent"}`}>{state.message}</p> : null}
      <button disabled={pending} className="group inline-flex items-center gap-3 border-b border-ink/25 pb-1.5 text-sm font-medium disabled:opacity-50">
        {pending ? "Please wait" : isSignIn ? "Sign in" : isUpdate ? "Set new password" : "Send reset link"}
        <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1">→</span>
      </button>
    </form>
  );
}
