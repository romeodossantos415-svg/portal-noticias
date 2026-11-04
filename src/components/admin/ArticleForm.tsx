"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveArticle, autosaveArticle, type ArticleFormState } from "@/app/admin/(panel)/noticias/actions";
import { RichEditor } from "./RichEditor";
import { ImageField } from "./MediaPicker";
import { Field, Input, Textarea, Select, Checkbox, Alert, Card } from "./ui";
import type { Article, Category, Columnist, Profile } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { Eye, Save, Send, CalendarClock, Globe, Archive, EyeOff } from "lucide-react";

type Props = {
  article: Partial<Article> | null;
  categories: Category[];
  authors: Pick<Profile, "id" | "full_name">[];
  columnists: Columnist[];
  tags: string[];
  me: { id: string; full_name: string };
  perms: { publish: boolean; editAny: boolean; seo: boolean };
  initialMsg?: string;
};

export function ArticleForm({ article, categories, authors, columnists, tags, me, perms, initialMsg }: Props) {
  const [state, action, pending] = useActionState<ArticleFormState, FormData>(saveArticle, { success: initialMsg });
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!article?.slug);
  const [subtitle, setSubtitle] = useState(article?.subtitle ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [tab, setTab] = useState<"conteudo" | "seo">("conteudo");
  const actionRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dirty = useRef(false);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  // Autosave a cada 20s para matérias existentes não publicadas
  useEffect(() => {
    if (!article?.id) return;
    const t = setInterval(async () => {
      if (!dirty.current) return;
      const r = await autosaveArticle(article.id!, { title, subtitle, content });
      if (r.ok) {
        dirty.current = false;
        setSaveStatus(`Rascunho salvo automaticamente às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`);
      }
    }, 20000);
    return () => clearInterval(t);
  }, [article?.id, title, subtitle, content]);

  const submit = (a: string) => {
    if (actionRef.current) actionRef.current.value = a;
    formRef.current?.requestSubmit();
  };

  const status = article?.status ?? "draft";
  const scheduledDefault = article?.scheduled_at ? new Date(new Date(article.scheduled_at).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";

  return (
    <form ref={formRef} action={action} className="grid lg:grid-cols-3 gap-6" onChange={() => (dirty.current = true)}>
      <input type="hidden" name="id" value={article?.id ?? ""} />
      <input ref={actionRef} type="hidden" name="action" value="draft" />

      <div className="lg:col-span-2 space-y-4">
        {state.error && <Alert kind="error">{state.error}</Alert>}
        {state.success && <Alert kind="success">{state.success}</Alert>}

        <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da matéria" required className="!text-2xl !font-bold !py-3" />
        <Textarea name="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtítulo / linha fina" className="!min-h-16" />

        <div className="flex gap-1 border-b">
          {(["conteudo", "seo"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-slate-900" : "border-transparent text-slate-500"}`}>
              {t === "conteudo" ? "Conteúdo" : "SEO e avançado"}
            </button>
          ))}
        </div>

        <div className={tab === "conteudo" ? "" : "hidden"}>
          <RichEditor name="content" initial={article?.content ?? ""} onChange={(h) => { setContent(h); dirty.current = true; }} />
        </div>

        <div className={`space-y-4 ${tab === "seo" ? "" : "hidden"}`}>
          <Card>
            <div className="space-y-4">
              <Field label="URL amigável (slug)" hint={`Endereço: /noticia/${slug || "..."}`}>
                <Input name="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
              </Field>
              <Field label="Resumo (excerpt)" hint="Usado em listagens e RSS. Se vazio, é gerado automaticamente.">
                <Textarea name="excerpt" defaultValue={article?.excerpt ?? ""} />
              </Field>
              {perms.seo && (
                <>
                  <Field label="Meta título (SEO)" hint="Até 60 caracteres. Se vazio, usa o título.">
                    <Input name="seo_title" defaultValue={article?.seo_title ?? ""} maxLength={120} />
                  </Field>
                  <Field label="Meta descrição (SEO)" hint="Até 160 caracteres.">
                    <Textarea name="seo_description" defaultValue={article?.seo_description ?? ""} maxLength={320} className="!min-h-16" />
                  </Field>
                  <Field label="URL canônica" hint="Somente se o conteúdo foi publicado originalmente em outro endereço.">
                    <Input name="canonical_url" defaultValue={article?.canonical_url ?? ""} />
                  </Field>
                </>
              )}
              <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                <Checkbox name="is_sponsored" value="true" defaultChecked={article?.is_sponsored} label="Conteúdo patrocinado (identificado como publicidade)" />
                <Input name="sponsor_name" defaultValue={article?.sponsor_name ?? ""} placeholder="Nome do patrocinador" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <aside className="space-y-4">
        <Card title="Publicação">
          <div className="space-y-3">
            <div className="text-xs text-slate-500">
              Status atual: <strong className="text-slate-900">{{ draft: "Rascunho", review: "Em revisão", scheduled: "Agendada", published: "Publicada", archived: "Arquivada" }[status]}</strong>
              {saveStatus && <div className="mt-1 text-emerald-700">{saveStatus}</div>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" disabled={pending} onClick={() => submit("draft")} className="inline-flex items-center justify-center gap-1.5 border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
                <Save className="h-4 w-4" /> Salvar rascunho
              </button>
              {!perms.publish ? (
                <button type="button" disabled={pending} onClick={() => submit("review")} className="inline-flex items-center justify-center gap-1.5 bg-amber-500 text-white rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50">
                  <Send className="h-4 w-4" /> Enviar p/ revisão
                </button>
              ) : (
                <button type="button" disabled={pending} onClick={() => submit("publish")} className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50">
                  <Globe className="h-4 w-4" /> {status === "published" ? "Atualizar" : "Publicar"}
                </button>
              )}
            </div>
            {perms.publish && (
              <div className="border-t pt-3 space-y-2">
                <label className="text-xs font-medium text-slate-600 flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> Agendar publicação</label>
                <div className="flex gap-2">
                  <Input type="datetime-local" name="scheduled_at" defaultValue={scheduledDefault} />
                  <button type="button" disabled={pending} onClick={() => submit("schedule")} className="shrink-0 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50">Agendar</button>
                </div>
                {status === "published" && (
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => submit("unpublish")} className="text-xs inline-flex items-center gap-1 text-slate-600 hover:text-red-600"><EyeOff className="h-3.5 w-3.5" /> Despublicar</button>
                    <button type="button" onClick={() => submit("archive")} className="text-xs inline-flex items-center gap-1 text-slate-600 hover:text-red-600"><Archive className="h-3.5 w-3.5" /> Arquivar</button>
                  </div>
                )}
              </div>
            )}
            {article?.slug && (
              <a href={`/noticia/${article.slug}${status !== "published" ? "?preview=1" : ""}`} target="_blank" className="text-xs inline-flex items-center gap-1 text-slate-600 hover:underline">
                <Eye className="h-3.5 w-3.5" /> {status === "published" ? "Ver no site" : "Pré-visualizar"}
              </a>
            )}
            {pending && <div className="text-xs text-slate-500">Salvando…</div>}
          </div>
        </Card>

        <Card title="Classificação">
          <div className="space-y-3">
            <Field label="Categoria">
              <Select name="category_id" defaultValue={article?.category_id ?? ""} required>
                <option value="">Selecione…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Autor">
              <Select name="author_id" defaultValue={article?.author_id ?? me.id} disabled={!perms.editAny}>
                {(perms.editAny ? authors : [{ id: me.id, full_name: me.full_name }]).map((a) => (
                  <option key={a.id} value={a.id}>{a.full_name}</option>
                ))}
              </Select>
            </Field>
            {!perms.editAny && <input type="hidden" name="author_id" value={article?.author_id ?? me.id} />}
            <Field label="Colunista (para artigos de opinião)">
              <Select name="columnist_id" defaultValue={article?.columnist_id ?? ""}>
                <option value="">— Nenhum —</option>
                {columnists.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Tags" hint="Separe por vírgula.">
              <Input name="tags" defaultValue={tags.join(", ")} placeholder="eleições, fortaleza, saúde" />
            </Field>
          </div>
        </Card>

        <Card title="Imagem de capa">
          <div className="space-y-3">
            <ImageField name="cover_url" label="Imagem" defaultValue={article?.cover_url} onPick={(m) => {
              const f = formRef.current!;
              (f.elements.namedItem("cover_alt") as HTMLInputElement).value ||= m.alt ?? "";
              (f.elements.namedItem("cover_caption") as HTMLInputElement).value ||= m.caption ?? "";
              (f.elements.namedItem("cover_credit") as HTMLInputElement).value ||= m.credit ?? "";
            }} />
            <Input name="cover_alt" defaultValue={article?.cover_alt ?? ""} placeholder="Texto alternativo (acessibilidade)" />
            <Input name="cover_caption" defaultValue={article?.cover_caption ?? ""} placeholder="Legenda" />
            <Input name="cover_credit" defaultValue={article?.cover_credit ?? ""} placeholder="Crédito (Foto: Fulano/Agência)" />
          </div>
        </Card>
      </aside>
    </form>
  );
}
