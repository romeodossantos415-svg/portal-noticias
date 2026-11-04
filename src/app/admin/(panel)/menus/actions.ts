"use server";
import { createClient } from "@/lib/supabase/server";
import { logActivity, requirePermission } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";
import type { MenuItem } from "@/lib/types";

export async function saveMenuItem(form: FormData) {
  await requirePermission("menus.manage");
  const supabase = await createClient();
  const id = String(form.get("id") || "");
  const type = String(form.get("type") || "link") as MenuItem["type"];
  const payload = {
    menu_key: String(form.get("menu_key") || "header"),
    label: String(form.get("label") || "").trim(),
    type,
    url: type === "link" ? String(form.get("url") || "") || null : null,
    category_id: type === "category" ? String(form.get("category_id") || "") || null : null,
    page_id: type === "page" ? String(form.get("page_id") || "") || null : null,
    parent_id: String(form.get("parent_id") || "") || null,
    is_visible: form.get("is_visible") === "on",
    open_new_tab: form.get("open_new_tab") === "on",
  };
  if (!payload.label) throw new Error("Rótulo obrigatório");
  if (id) {
    await supabase.from("menu_items").update(payload).eq("id", id);
  } else {
    const { data: max } = await supabase.from("menu_items").select("sort_order").eq("menu_key", payload.menu_key).order("sort_order", { ascending: false }).limit(1).maybeSingle();
    await supabase.from("menu_items").insert({ ...payload, sort_order: (max?.sort_order ?? 0) + 1 });
  }
  await logActivity(id ? "editou" : "criou", "item de menu", id || payload.label);
  revalidateSite();
}

export async function deleteMenuItem(form: FormData) {
  await requirePermission("menus.manage");
  const supabase = await createClient();
  await supabase.from("menu_items").delete().eq("id", String(form.get("id")));
  revalidateSite();
}

export async function reorderMenu(ids: string[]) {
  await requirePermission("menus.manage");
  const supabase = await createClient();
  await Promise.all(ids.map((id, i) => supabase.from("menu_items").update({ sort_order: i }).eq("id", id)));
  revalidateSite();
  return { ok: true };
}
