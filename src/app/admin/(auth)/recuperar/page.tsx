"use client";
import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "../actions";

export default function RecoverPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  return (
    <form action={action} className="space-y-4">
      <h1 className="font-semibold text-lg">Recuperar senha</h1>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">{state.success}</p>}
      <label className="block text-sm">
        <span className="text-slate-600">E-mail cadastrado</span>
        <input name="email" type="email" required className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
      </label>
      <button disabled={pending} className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-semibold disabled:opacity-60">
        {pending ? "Enviando…" : "Enviar link de recuperação"}
      </button>
      <Link href="/admin/login" className="block text-center text-sm text-slate-500 hover:underline">
        Voltar ao login
      </Link>
    </form>
  );
}
