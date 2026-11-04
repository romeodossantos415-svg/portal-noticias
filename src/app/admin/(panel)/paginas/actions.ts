"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logActivity, requirePermission } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";
import { slugify } from "@/lib/utils";
import type { PageBlock } from "@/lib/types";

export type PageState = { error?: string; success?: string };

export async function savePage(_: PageState, form: FormData): Promise<PageState> {
  await requirePermission("pages.manage");
  const supabase = await createClient();
  const id = String(form.get("id") || "");
  const title = String(form.get("title") || "").trim();
  if (!title) return { error: "Título obrigatório." };
  let blocks: PageBlock[] = [];
  try {
    blocks = JSON.parse(String(form.get("blocks") || "[]"));
  } catch {
    return { error: "Blocos inválidos." };
  }
  const payload = {
    title,
    slug: slugify(String(form.get("slug") || title)),
    blocks,
    content: String(form.get("content") || "") || null,
    seo_title: String(form.get("seo_title") || "") || null,
    seo_description: String(form.get("seo_description") || "") || null,
    is_published: form.get("is_published") === "on",
    show_in_footer: form.get("show_in_footer") === "on",
  };
  if (id) {
    const { error } = await supabase.from("pages").update(payload).eq("id", id);
    if (error) return { error: error.message };
    await logActivity("editou", "página", id, { title });
    revalidateSite([`/pagina/${payload.slug}`]);
    return { success: "Página salva." };
  }
  const { data, error } = await supabase.from("pages").insert(payload).select("id").single();
  if (error) return { error: error.message };
  await logActivity("criou", "página", data.id, { title });
  revalidateSite();
  redirect(`/admin/paginas/${data.id}`);
}

export async function deletePage(form: FormData) {
  await requirePermission("pages.manage");
  const supabase = await createClient();
  const id = String(form.get("id"));
  const { data: p } = await supabase.from("pages").select("is_system").eq("id", id).single();
  if (p?.is_system) throw new Error("Páginas do sistema não podem ser excluídas (apenas despublicadas).");
  await supabase.from("pages").delete().eq("id", id);
  await logActivity("excluiu", "página", id);
  revalidateSite();
  redirect("/admin/paginas");
}
