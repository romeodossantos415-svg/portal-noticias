"use client";
import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, type AuthState } from "../actions";
import { Suspense } from "react";

function LoginForm() {
  const sp = useSearchParams();
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={sp.get("next") ?? "/admin"} />
      <h1 className="font-semibold text-lg">Entrar</h1>
      {state.error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{state.error}</p>}
      <label className="block text-sm">
        <span className="text-slate-600">E-mail</span>
        <input name="email" type="email" required autoComplete="email" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Senha</span>
        <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
      </label>
      <button disabled={pending} className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-semibold disabled:opacity-60">
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <Link href="/admin/recuperar" className="block text-center text-sm text-slate-500 hover:underline">
        Esqueci minha senha
      </Link>
    </form>
  );
}
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
