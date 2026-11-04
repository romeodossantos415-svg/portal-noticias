"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { can, logActivity, requireUser } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";
import { excerptFrom, readingTime, slugify } from "@/lib/utils";
import type { ArticleStatus } from "@/lib/types";

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(3, "Título muito curto").max(200),
  slug: z.string().max(140).optional(),
  subtitle: z.string().max(400).optional(),
  excerpt: z.string().max(600).optional(),
  content: z.string().default(""),
  category_id: z.string().uuid().optional().or(z.literal("")),
  author_id: z.string().uuid().optional().or(z.literal("")),
  columnist_id: z.string().uuid().optional().or(z.literal("")),
  cover_url: z.string().optional(),
  cover_caption: z.string().optional(),
  cover_credit: z.string().optional(),
  cover_alt: z.string().optional(),
  tags: z.string().optional(),
  seo_title: z.string().max(120).optional(),
  seo_description: z.string().max(320).optional(),
  canonical_url: z.string().optional(),
  is_sponsored: z.coerce.boolean().optional(),
  sponsor_name: z.string().optional(),
  scheduled_at: z.string().optional(),
  action: z.enum(["draft", "review", "publish", "schedule", "unpublish", "archive"]),
});

export type ArticleFormState = { error?: string; success?: string; id?: string; savedAt?: string };

export async function saveArticle(_: ArticleFormState, form: FormData): Promise<ArticleFormState> {
  const user = await requireUser();
  const raw = Object.fromEntries(form.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const d = parsed.data;
  const supabase = await createClient();
  const categoryId = d.category_id || null;

  // ---- autorização no servidor ----
  const isNew = !d.id;
  let existing: { author_id: string | null; created_by: string | null; status: ArticleStatus; category_id: string | null; slug: string } | null = null;
  if (!isNew) {
    const { data } = await supabase.from("articles").select("author_id, created_by, status, category_id, slug").eq("id", d.id!).single();
    if (!data) return { error: "Matéria não encontrada." };
    existing = data;
    const own = data.author_id === user.id || data.created_by === user.id;
    const okEdit = (own && (await can("articles.edit_own", data.category_id))) || (await can("articles.edit_any", data.category_id));
    if (!okEdit) return { error: "Você não tem permissão para editar esta matéria." };
  } else if (!(await can("articles.create", categoryId))) {
    return { error: "Você não tem permissão para criar matérias nesta categoria." };
  }

  const wantsPublish = d.action === "publish" || d.action === "schedule" || d.action === "unpublish" || d.action === "archive";
  if (wantsPublish && !(await can("articles.publish", categoryId))) {
    return { error: "Você não tem permissão para publicar. Envie para revisão." };
  }
  if (d.author_id && d.author_id !== user.id && !(await can("articles.edit_any", categoryId))) {
    return { error: "Você não pode definir outro autor." };
  }

  // ---- status ----
  let status: ArticleStatus = "draft";
  let published_at: string | null | undefined = undefined;
  let scheduled_at: string | null = null;
  if (d.action === "review") status = "review";
  if (d.action === "publish") {
    status = "published";
    published_at = existing?.status === "published" ? undefined : new Date().toISOString();
  }
  if (d.action === "schedule") {
    if (!d.scheduled_at) return { error: "Informe a data e hora do agendamento." };
    const when = new Date(d.scheduled_at);
    if (isNaN(when.getTime()) || when <= new Date()) return { error: "A data de agendamento deve ser no futuro." };
    status = "scheduled";
    scheduled_at = when.toISOString();
  }
  if (d.action === "unpublish") status = "draft";
  if (d.action === "archive") status = "archived";

  // ---- slug único ----
  let slug = slugify(d.slug || d.title) || `materia-${Date.now()}`;
  if (!existing || existing.slug !== slug) {
    const { data: clash } = await supabase.from("articles").select("id").eq("slug", slug).neq("id", d.id || "00000000-0000-0000-0000-000000000000").maybeSingle();
    if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const payload = {
    title: d.title.trim(),
    slug,
    subtitle: d.subtitle?.trim() || null,
    excerpt: d.excerpt?.trim() || excerptFrom(d.content),
    content: d.content,
    category_id: categoryId,
    author_id: d.author_id || user.id,
    columnist_id: d.columnist_id || null,
    cover_url: d.cover_url || null,
    cover_caption: d.cover_caption || null,
    cover_credit: d.cover_credit || null,
    cover_alt: d.cover_alt || null,
    seo_title: d.seo_title || null,
    seo_description: d.seo_description || null,
    canonical_url: d.canonical_url || null,
    is_sponsored: !!d.is_sponsored,
    sponsor_name: d.sponsor_name || null,
    reading_time: readingTime(d.content),
    status,
    scheduled_at,
    ...(published_at !== undefined ? { published_at } : {}),
  };

  let id = d.id || "";
  if (isNew) {
    // Insert sempre como draft/review (RLS), depois promove se necessário
    const { data, error } = await supabase
      .from("articles")
      .insert({ ...payload, status: status === "review" ? "review" : "draft", created_by: user.id })
      .select("id")
      .single();
    if (error) return { error: `Erro ao criar: ${error.message}` };
    id = data.id;
    if (status !== "draft" && status !== "review") {
      const { error: e2 } = await supabase.from("articles").update({ status, scheduled_at, published_at }).eq("id", id);
      if (e2) return { error: `Criada como rascunho, mas não foi possível publicar: ${e2.message}`, id };
    }
    await logActivity("criou", "matéria", id, { title: payload.title, status });
  } else {
    const { error } = await supabase.from("articles").update(payload).eq("id", id);
    if (error) return { error: `Erro ao salvar: ${error.message}` };
    await logActivity(status === "published" ? "publicou" : "editou", "matéria", id, { title: payload.title, status });
  }

  // tags
  const tagNames = (d.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20);
  await supabase.from("article_tags").delete().eq("article_id", id);
  for (const name of tagNames) {
    const tslug = slugify(name);
    let { data: tag } = await supabase.from("tags").select("id").eq("slug", tslug).maybeSingle();
    if (!tag) {
      const { data: created } = await supabase.from("tags").insert({ name, slug: tslug }).select("id").single();
      tag = created;
    }
    if (tag) await supabase.from("article_tags").insert({ article_id: id, tag_id: tag.id });
  }

  revalidateSite([`/noticia/${slug}`]);
  const msg = { draft: "Rascunho salvo.", review: "Enviada para revisão.", publish: "Matéria publicada!", schedule: "Publicação agendada.", unpublish: "Matéria despublicada.", archive: "Matéria arquivada." }[d.action];
  if (isNew) redirect(`/admin/noticias/${id}?msg=${encodeURIComponent(msg)}`);
  return { success: msg, id, savedAt: new Date().toISOString() };
}

/** Autosave silencioso: só atualiza campos de texto de uma matéria existente, sem mudar status. */
export async function autosaveArticle(id: string, data: { title: string; subtitle: string; content: string }) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: a } = await supabase.from("articles").select("author_id, created_by, category_id, status").eq("id", id).single();
  if (!a) return { ok: false };
  if (a.status === "published") return { ok: false, reason: "published" }; // não sobrescreve publicada silenciosamente
  const own = a.author_id === user.id || a.created_by === user.id;
  const okEdit = (own && (await can("articles.edit_own", a.category_id))) || (await can("articles.edit_any", a.category_id));
  if (!okEdit) return { ok: false };
  const { error } = await supabase.from("articles").update({ title: data.title || "Sem título", subtitle: data.subtitle || null, content: data.content }).eq("id", id);
  return { ok: !error, at: new Date().toISOString() };
}

export async function deleteArticle(form: FormData) {
  const id = String(form.get("id"));
  const supabase = await createClient();
  const { data: a } = await supabase.from("articles").select("category_id, title, slug").eq("id", id).single();
  if (!a) return;
  if (!(await can("articles.delete", a.category_id))) throw new Error("Sem permissão para excluir.");
  await supabase.from("articles").delete().eq("id", id);
  await logActivity("excluiu", "matéria", id, { title: a.title });
  revalidateSite([`/noticia/${a.slug}`]);
  redirect("/admin/noticias?msg=Matéria excluída.");
}

export async function restoreVersion(form: FormData) {
  const id = String(form.get("id"));
  const versionId = String(form.get("version_id"));
  const user = await requireUser();
  const supabase = await createClient();
  const [{ data: a }, { data: v }] = await Promise.all([
    supabase.from("articles").select("author_id, created_by, category_id").eq("id", id).single(),
    supabase.from("article_versions").select("*").eq("id", versionId).eq("article_id", id).single(),
  ]);
  if (!a || !v) throw new Error("Versão não encontrada.");
  const own = a.author_id === user.id || a.created_by === user.id;
  const okEdit = (own && (await can("articles.edit_own", a.category_id))) || (await can("articles.edit_any", a.category_id));
  if (!okEdit) throw new Error("Sem permissão.");
  await supabase.from("articles").update({ title: v.title, subtitle: v.subtitle, excerpt: v.excerpt, content: v.content }).eq("id", id);
  await logActivity("restaurou versão", "matéria", id, { version: v.version_number });
  revalidateSite();
  redirect(`/admin/noticias/${id}?msg=${encodeURIComponent(`Versão ${v.version_number} restaurada.`)}`);
}

export async function quickStatus(form: FormData) {
  const id = String(form.get("id"));
  const status = String(form.get("status")) as ArticleStatus;
  const supabase = await createClient();
  const { data: a } = await supabase.from("articles").select("category_id, slug, status").eq("id", id).single();
  if (!a) return;
  if (!(await can("articles.publish", a.category_id))) throw new Error("Sem permissão.");
  const patch: Record<string, unknown> = { status };
  if (status === "published" && a.status !== "published") patch.published_at = new Date().toISOString();
  await supabase.from("articles").update(patch).eq("id", id);
  await logActivity(`alterou status para ${status}`, "matéria", id);
  revalidateSite([`/noticia/${a.slug}`]);
}
