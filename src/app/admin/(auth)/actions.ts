"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/utils";

export type AuthState = { error?: string; success?: string };

// Proteção simples contra força bruta em memória (por instância). Supabase Auth também aplica rate limit no servidor.
const attempts = new Map<string, { count: number; until: number }>();
function checkRate(key: string) {
  const now = Date.now();
  const a = attempts.get(key);
  if (a && a.until > now && a.count >= 5) return false;
  return true;
}
function registerFail(key: string) {
  const now = Date.now();
  const a = attempts.get(key) ?? { count: 0, until: 0 };
  a.count = a.until > now ? a.count + 1 : 1;
  a.until = now + 15 * 60 * 1000;
  attempts.set(key, a);
}

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/admin");
  const ip = (await headers()).get("x-forwarded-for") ?? "local";
  const key = `${ip}:${email}`;
  if (!email || !password) return { error: "Informe e-mail e senha." };
  if (!checkRate(key)) return { error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    registerFail(key);
    return { error: "E-mail ou senha inválidos." };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("status").eq("id", user!.id).single();
  if (profile?.status === "blocked") {
    await supabase.auth.signOut();
    return { error: "Sua conta está bloqueada. Fale com o administrador." };
  }
  attempts.delete(key);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function requestPasswordReset(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Informe o e-mail." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: siteUrl("/admin/redefinir") });
  return { success: "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha." };
}

export async function updatePassword(_: AuthState, form: FormData): Promise<AuthState> {
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < 8) return { error: "A senha deve ter pelo menos 8 caracteres." };
  if (password !== confirm) return { error: "As senhas não conferem." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Não foi possível redefinir a senha. O link pode ter expirado." };
  redirect("/admin");
}
