"use client";
import { useActionState, useEffect, useState } from "react";
import { updatePassword, type AuthState } from "../actions";
import { createClient } from "@/lib/supabase/client";

export default function ResetPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Troca o código/hash do link de e-mail por uma sessão
    const supabase = createClient();
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    (async () => {
      if (code) await supabase.auth.exchangeCodeForSession(code);
      setReady(true);
    })();
    const { data } = supabase.auth.onAuthStateChange(() => setReady(true));
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <form action={action} className="space-y-4">
      <h1 className="font-semibold text-lg">Definir nova senha</h1>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <label className="block text-sm">
        <span className="text-slate-600">Nova senha</span>
        <input name="password" type="password" minLength={8} required autoComplete="new-password" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Confirmar senha</span>
        <input name="confirm" type="password" minLength={8} required autoComplete="new-password" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
      </label>
      <button disabled={pending || !ready} className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-semibold disabled:opacity-60">
        {pending ? "Salvando…" : "Salvar senha"}
      </button>
    </form>
  );
}
