import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile || profile.status !== "active") return null;
  return profile as Profile;
});

/** Conjunto de permissões efetivas do usuário atual (para a UI). A autorização real é feita no banco (RLS) e nas actions. */
export const getPermissions = cache(async (): Promise<Set<string>> => {
  const user = await getCurrentUser();
  if (!user) return new Set();
  const supabase = await createClient();
  const { data: all } = await supabase.from("permissions").select("key");
  const keys = (all ?? []).map((p) => p.key as string);
  if (user.role === "master") return new Set(keys);
  const results = await Promise.all(
    keys.map(async (k) => {
      const { data } = await supabase.rpc("has_permission", { perm: k, cat: null });
      return [k, !!data] as const;
    }),
  );
  return new Set(results.filter(([, ok]) => ok).map(([k]) => k));
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Garante permissão no servidor; lança erro em Server Actions. */
export async function requirePermission(perm: string, categoryId?: string | null) {
  const user = await requireUser();
  if (user.role === "master") return user;
  const supabase = await createClient();
  const { data } = await supabase.rpc("has_permission", { perm, cat: categoryId ?? null });
  if (!data) throw new Error("Você não tem permissão para esta ação.");
  return user;
}

export async function can(perm: string, categoryId?: string | null) {
  const user = await getCurrentUser();
  if (!user) return false;
  if (user.role === "master") return true;
  const supabase = await createClient();
  const { data } = await supabase.rpc("has_permission", { perm, cat: categoryId ?? null });
  return !!data;
}

export async function logActivity(action: string, entityType: string, entityId: string, details: Record<string, unknown> = {}) {
  const supabase = await createClient();
  await supabase.rpc("log_activity", { p_action: action, p_entity_type: entityType, p_entity_id: entityId, p_details: details });
}
