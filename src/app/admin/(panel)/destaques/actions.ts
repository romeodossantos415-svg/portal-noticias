"use server";
import { createClient } from "@/lib/supabase/server";
import { logActivity, requirePermission } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";

export async function setSlotItems(slotKey: string, articleIds: string[]) {
  await requirePermission("featured.manage");
  const supabase = await createClient();
  const { data: slot } = await supabase.from("featured_slots").select("max_items").eq("key", slotKey).single();
  const ids = articleIds.slice(0, slot?.max_items ?? 10);
  await supabase.from("featured_items").delete().eq("slot_key", slotKey);
  if (ids.length) {
    const { error } = await supabase.from("featured_items").insert(ids.map((article_id, i) => ({ slot_key: slotKey, article_id, sort_order: i })));
    if (error) return { error: error.message };
  }
  await logActivity("atualizou destaques", "slot", slotKey, { count: ids.length });
  revalidateSite();
  return { ok: true };
}

export async function updateSlot(form: FormData) {
  await requirePermission("featured.manage");
  const supabase = await createClient();
  const key = String(form.get("key"));
  await supabase
    .from("featured_slots")
    .update({ is_active: form.get("is_active") === "on", max_items: Number(form.get("max_items") || 5), style: String(form.get("style") || "default") })
    .eq("key", key);
  revalidateSite();
}

export async function searchPublished(q: string) {
  await requirePermission("featured.manage");
  const supabase = await createClient();
  let query = supabase.from("articles").select("id, title, slug, cover_url, published_at, category:categories(name)").eq("status", "published").order("published_at", { ascending: false }).limit(20);
  if (q) query = query.ilike("title", `%${q}%`);
  const { data } = await query;
  return (data ?? []).map((a) => ({ ...a, category: a.category as unknown as { name: string } | null }));
}
