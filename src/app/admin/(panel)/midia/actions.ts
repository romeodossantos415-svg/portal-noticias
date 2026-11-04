"use server";
import { createClient } from "@/lib/supabase/server";
import { logActivity, requirePermission } from "@/lib/auth";

export async function updateMedia(form: FormData) {
  await requirePermission("media.upload");
  const supabase = await createClient();
  const id = String(form.get("id"));
  const { error } = await supabase.from("media").update({ alt: String(form.get("alt") || "") || null, caption: String(form.get("caption") || "") || null, credit: String(form.get("credit") || "") || null, folder_id: String(form.get("folder_id") || "") || null }).eq("id", id);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function deleteMedia(form: FormData) {
  await requirePermission("media.manage");
  const supabase = await createClient();
  const id = String(form.get("id"));
  const { data: m } = await supabase.from("media").select("storage_path, url").eq("id", id).single();
  if (!m) return { error: "Arquivo não encontrado" };
  const { count } = await supabase.from("articles").select("id", { count: "exact", head: true }).or(`cover_url.eq.${m.url},content.ilike.%${m.storage_path}%`);
  if ((count ?? 0) > 0) return { error: `Este arquivo é usado em ${count} matéria(s). Remova-o delas antes de excluir.` };
  await supabase.storage.from("media").remove([m.storage_path]);
  await supabase.from("media").delete().eq("id", id);
  await logActivity("excluiu", "mídia", id);
  return { ok: true };
}

export async function createFolder(form: FormData) {
  await requirePermission("media.manage");
  const supabase = await createClient();
  const name = String(form.get("name") || "").trim();
  if (!name) return;
  await supabase.from("media_folders").insert({ name });
}

export async function deleteFolder(form: FormData) {
  await requirePermission("media.manage");
  const supabase = await createClient();
  await supabase.from("media_folders").delete().eq("id", String(form.get("id")));
}
