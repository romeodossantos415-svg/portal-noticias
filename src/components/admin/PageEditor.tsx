"use client";
import type { ActionState } from "@/lib/types";
import { useActionState, useState } from "react";
import { savePage, type PageState } from "@/app/admin/(panel)/paginas/actions";
import { SortableList } from "./SortableList";
import { RichEditor } from "./RichEditor";
import { ImageField } from "./MediaPicker";
import { Field, Input, Textarea, Select, Checkbox, SubmitButton, Button, Alert, Card } from "./ui";
import type { Page, PageBlock } from "@/lib/types";
import { Trash2, Plus, Eye } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 9);
const NEW: Record<PageBlock["type"], () => PageBlock> = {
  heading: () => ({ id: uid(), type: "heading", text: "Título da seção", level: 2 }),
  text: () => ({ id: uid(), type: "text", html: "<p>Texto…</p>" }),
  image: () => ({ id: uid(), type: "image", url: "", caption: "", alt: "" }),
  banner: () => ({ id: uid(), type: "banner", title: "Chamada", subtitle: "", image_url: "", cta_label: "", cta_url: "" }),
  columns: () => ({ id: uid(), type: "columns", items: [{ title: "Coluna 1", html: "<p>…</p>" }, { title: "Coluna 2", html: "<p>…</p>" }] }),
  team: () => ({ id: uid(), type: "team", members: [{ name: "Nome", role: "Função", photo_url: "" }] }),
  embed: () => ({ id: uid(), type: "embed", url: "" }),
};
const LABELS: Record<PageBlock["type"], string> = { heading: "Título", text: "Texto", image: "Imagem", banner: "Banner", columns: "Colunas", team: "Equipe", embed: "Vídeo / embed" };

export function PageEditor({ page }: { page: Page | null }) {
  const [state, action] = useActionState<PageState, FormData>(savePage, {});
  const [blocks, setBlocks] = useState<PageBlock[]>(page?.blocks ?? []);
  const update = (id: string, patch: Partial<PageBlock>) => setBlocks(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as PageBlock) : b)));

  return (
    <form action={action} className="grid lg:grid-cols-3 gap-6">
      <input type="hidden" name="id" value={page?.id ?? ""} />
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
      <div className="lg:col-span-2 space-y-4">
        {state.error && <Alert kind="error">{state.error}</Alert>}
        {state.success && <Alert kind="success">{state.success}</Alert>}
        <Input name="title" defaultValue={page?.title} placeholder="Título da página" required className="!text-2xl !font-bold !py-3" />

        <Card title="Blocos de conteúdo (editor visual)">
          <div className="flex flex-wrap gap-1 mb-4">
            {(Object.keys(NEW) as PageBlock["type"][]).map((t) => (
              <button key={t} type="button" onClick={() => setBlocks([...blocks, NEW[t]()])} className="text-xs border rounded-lg px-2.5 py-1.5 bg-white hover:bg-slate-50 inline-flex items-center gap-1">
                <Plus className="h-3 w-3" /> {LABELS[t]}
              </button>
            ))}
          </div>
          <SortableList
            items={blocks}
            onChange={setBlocks}
            render={(b) => (
              <div className="space-y-2 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-500">{LABELS[b.type]}</span>
                  <button type="button" onClick={() => setBlocks(blocks.filter((x) => x.id !== b.id))} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
                <BlockFields b={b} update={(p) => update(b.id, p)} />
              </div>
            )}
          />
          {!blocks.length && <p className="text-sm text-slate-500 text-center py-4">Adicione blocos acima ou use o texto livre abaixo.</p>}
        </Card>

        <Card title="Texto livre (opcional, exibido após os blocos)">
          <RichEditor name="content" initial={page?.content ?? ""} />
        </Card>
      </div>
      <aside className="space-y-4">
        <Card title="Publicação">
          <div className="space-y-3">
            <Checkbox name="is_published" defaultChecked={page?.is_published ?? true} label="Publicada" />
            <br />
            <Checkbox name="show_in_footer" defaultChecked={page?.show_in_footer ?? false} label="Mostrar link no rodapé" />
            <Field label="URL (slug)"><Input name="slug" defaultValue={page?.slug} /></Field>
            <SubmitButton className="w-full">Salvar página</SubmitButton>
            {page && <a href={`/pagina/${page.slug}`} target="_blank" className="text-xs inline-flex items-center gap-1 text-slate-600 hover:underline"><Eye className="h-3.5 w-3.5" /> Ver página</a>}
          </div>
        </Card>
        <Card title="SEO">
          <div className="space-y-3">
            <Field label="Meta título"><Input name="seo_title" defaultValue={page?.seo_title ?? ""} /></Field>
            <Field label="Meta descrição"><Textarea name="seo_description" defaultValue={page?.seo_description ?? ""} className="!min-h-16" /></Field>
          </div>
        </Card>
      </aside>
    </form>
  );
}

function BlockFields({ b, update }: { b: PageBlock; update: (p: Partial<PageBlock>) => void }) {
  const cls = "w-full border rounded-lg px-2.5 py-1.5 text-sm";
  switch (b.type) {
    case "heading":
      return (
        <div className="flex gap-2">
          <input className={cls} value={b.text} onChange={(e) => update({ text: e.target.value })} />
          <select className={`${cls} !w-24`} value={b.level ?? 2} onChange={(e) => update({ level: Number(e.target.value) as 1 | 2 | 3 })}>
            <option value={1}>H1</option><option value={2}>H2</option><option value={3}>H3</option>
          </select>
        </div>
      );
    case "text":
      return <textarea className={`${cls} min-h-24 font-mono text-xs`} value={b.html} onChange={(e) => update({ html: e.target.value })} placeholder="HTML ou texto com <p>…</p>" />;
    case "image":
      return (
        <div className="space-y-2">
          <ImageField name={`_img_${b.id}`} label="" defaultValue={b.url} onPick={(m) => update({ url: m.url, alt: m.alt ?? "", caption: m.caption ?? "" })} />
          <input className={cls} placeholder="URL da imagem" value={b.url} onChange={(e) => update({ url: e.target.value })} />
          <input className={cls} placeholder="Legenda" value={b.caption ?? ""} onChange={(e) => update({ caption: e.target.value })} />
          <input className={cls} placeholder="Texto alternativo" value={b.alt ?? ""} onChange={(e) => update({ alt: e.target.value })} />
        </div>
      );
    case "banner":
      return (
        <div className="grid md:grid-cols-2 gap-2">
          <input className={cls} placeholder="Título" value={b.title} onChange={(e) => update({ title: e.target.value })} />
          <input className={cls} placeholder="Subtítulo" value={b.subtitle ?? ""} onChange={(e) => update({ subtitle: e.target.value })} />
          <input className={cls} placeholder="URL da imagem de fundo" value={b.image_url ?? ""} onChange={(e) => update({ image_url: e.target.value })} />
          <div className="flex gap-2">
            <input className={cls} placeholder="Texto do botão" value={b.cta_label ?? ""} onChange={(e) => update({ cta_label: e.target.value })} />
            <input className={cls} placeholder="Link do botão" value={b.cta_url ?? ""} onChange={(e) => update({ cta_url: e.target.value })} />
          </div>
        </div>
      );
    case "columns":
      return (
        <div className="space-y-2">
          {b.items.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input className={`${cls} !w-40`} value={c.title} onChange={(e) => update({ items: b.items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
              <textarea className={`${cls} min-h-12 text-xs`} value={c.html} onChange={(e) => update({ items: b.items.map((x, j) => (j === i ? { ...x, html: e.target.value } : x)) })} />
              <button type="button" onClick={() => update({ items: b.items.filter((_, j) => j !== i) })} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <Button type="button" variant="secondary" className="!py-1 !text-xs" onClick={() => update({ items: [...b.items, { title: "Coluna", html: "<p>…</p>" }] })}>+ coluna</Button>
        </div>
      );
    case "team":
      return (
        <div className="space-y-2">
          {b.members.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input className={cls} placeholder="Nome" value={m.name} onChange={(e) => update({ members: b.members.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
              <input className={cls} placeholder="Função" value={m.role} onChange={(e) => update({ members: b.members.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)) })} />
              <input className={cls} placeholder="URL da foto" value={m.photo_url ?? ""} onChange={(e) => update({ members: b.members.map((x, j) => (j === i ? { ...x, photo_url: e.target.value } : x)) })} />
              <button type="button" onClick={() => update({ members: b.members.filter((_, j) => j !== i) })} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <Button type="button" variant="secondary" className="!py-1 !text-xs" onClick={() => update({ members: [...b.members, { name: "", role: "", photo_url: "" }] })}>+ membro</Button>
        </div>
      );
    case "embed":
      return <input className={cls} placeholder="URL do YouTube/Vimeo ou embed" value={b.url} onChange={(e) => update({ url: e.target.value })} />;
  }
}
