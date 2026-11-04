"use server";
import { createClient } from "@/lib/supabase/server";
import { logActivity, requirePermission } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";
import { slugify } from "@/lib/utils";

export async function saveCategory(form: FormData) {
  await requirePermission("categories.manage");
  const supabase = await createClient();
  const id = String(form.get("id") || "");
  const name = String(form.get("name") || "").trim();
  if (!name) throw new Error("Nome obrigatório");
  const payload = {
    name,
    slug: slugify(String(form.get("slug") || name)),
    description: String(form.get("description") || "") || null,
    color: String(form.get("color") || "#111827"),
    image_url: String(form.get("image_url") || "") || null,
    parent_id: String(form.get("parent_id") || "") || null,
    is_active: form.get("is_active") === "on",
    show_on_home: form.get("show_on_home") === "on",
    home_layout: String(form.get("home_layout") || "grid"),
    home_limit: Number(form.get("home_limit") || 4),
  };
  if (id) {
    const { error } = await supabase.from("categories").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
    await logActivity("editou", "categoria", id, { name });
  } else {
    const { data: max } = await supabase.from("categories").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await supabase.from("categories").insert({ ...payload, sort_order: (max?.sort_order ?? 0) + 1 }).select("id").single();
    if (error) throw new Error(error.message);
    await logActivity("criou", "categoria", data.id, { name });
  }
  revalidateSite();
}

export async function deleteCategory(form: FormData) {
  await requirePermission("categories.manage");
  const supabase = await createClient();
  const id = String(form.get("id"));
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity("excluiu", "categoria", id);
  revalidateSite();
}

export async function reorderCategories(ids: string[]) {
  await requirePermission("categories.manage");
  const supabase = await createClient();
  await Promise.all(ids.map((id, i) => supabase.from("categories").update({ sort_order: i }).eq("id", id)));
  revalidateSite();
  return { ok: true };
}
