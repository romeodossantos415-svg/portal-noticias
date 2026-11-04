"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { SortableList } from "./SortableList";
import { saveMenuItem, deleteMenuItem, reorderMenu } from "@/app/admin/(panel)/menus/actions";
import { Field, Input, Select, Checkbox, SubmitButton, Button, ConfirmButton } from "./ui";
import type { MenuItem } from "@/lib/types";
import { Pencil, Plus, EyeOff, CornerDownRight } from "lucide-react";

export function MenuManager({ menuKey, items, categories, pages }: { menuKey: string; items: MenuItem[]; categories: { id: string; name: string }[]; pages: { id: string; title: string }[] }) {
  const [list, setList] = useState(items);
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);
  const [type, setType] = useState<MenuItem["type"]>("link");
  const [pending, start] = useTransition();
  const dirty = list.map((i) => i.id).join() !== items.map((i) => i.id).join();
  const roots = list.filter((i) => !i.parent_id);
  const open = (it: Partial<MenuItem>) => { setEditing(it); setType(it.type ?? "link"); };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit text-sm">
        <Link href="?menu=header" className={`px-3 py-1.5 rounded-md ${menuKey === "header" ? "bg-slate-900 text-white" : ""}`}>Menu principal</Link>
        <Link href="?menu=footer" className={`px-3 py-1.5 rounded-md ${menuKey === "footer" ? "bg-slate-900 text-white" : ""}`}>Menu do rodapé</Link>
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={!dirty || pending} onClick={() => start(async () => { await reorderMenu(list.map((i) => i.id)); })}>{pending ? "Salvando…" : "Salvar ordem"}</Button>
            <Button onClick={() => open({ is_visible: true, type: "link" })}><Plus className="h-4 w-4" /> Nova aba</Button>
          </div>
          <SortableList
            items={list}
            onChange={setList}
            render={(it) => (
              <div className="flex items-center gap-2 text-sm">
                {it.parent_id && <CornerDownRight className="h-4 w-4 text-slate-300 ml-4" />}
                <span className="font-medium">{it.label}</span>
                <span className="text-xs text-slate-400">{{ link: it.url, category: "categoria", page: "página", home: "início" }[it.type]}</span>
                {!it.is_visible && <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                <button type="button" onClick={() => open(it)} className="ml-auto p-1.5 hover:bg-slate-100 rounded"><Pencil className="h-4 w-4" /></button>
              </div>
            )}
          />
        </div>
        <div className="lg:col-span-2">
          {editing ? (
            <form action={async (fd) => { await saveMenuItem(fd); setEditing(null); }} className="bg-white border rounded-xl p-5 space-y-3 sticky top-6">
              <h3 className="font-semibold">{editing.id ? "Editar aba" : "Nova aba"}</h3>
              <input type="hidden" name="id" value={editing.id ?? ""} />
              <input type="hidden" name="menu_key" value={menuKey} />
              <Field label="Rótulo"><Input name="label" defaultValue={editing.label} required /></Field>
              <Field label="Tipo">
                <Select name="type" value={type} onChange={(e) => setType(e.target.value as MenuItem["type"])}>
                  <option value="home">Página inicial</option>
                  <option value="category">Categoria</option>
                  <option value="page">Página do site</option>
                  <option value="link">Link (interno ou externo)</option>
                </Select>
              </Field>
              {type === "link" && <Field label="URL" hint="Ex.: /videos ou https://exemplo.com"><Input name="url" defaultValue={editing.url ?? ""} /></Field>}
              {type === "category" && (
                <Field label="Categoria">
                  <Select name="category_id" defaultValue={editing.category_id ?? ""} required>
                    <option value="">Selecione…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </Field>
              )}
              {type === "page" && (
                <Field label="Página">
                  <Select name="page_id" defaultValue={editing.page_id ?? ""} required>
                    <option value="">Selecione…</option>
                    {pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </Select>
                </Field>
              )}
              <Field label="Item pai (para submenu)">
                <Select name="parent_id" defaultValue={editing.parent_id ?? ""}>
                  <option value="">— Nível principal —</option>
                  {roots.filter((r) => r.id !== editing.id).map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </Select>
              </Field>
              <div className="flex gap-4">
                <Checkbox name="is_visible" defaultChecked={editing.is_visible ?? true} label="Visível" />
                <Checkbox name="open_new_tab" defaultChecked={editing.open_new_tab} label="Abrir em nova aba" />
              </div>
              <div className="flex gap-2 pt-2">
                <SubmitButton>Salvar</SubmitButton>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
                {editing.id && <ConfirmButton formAction={deleteMenuItem} message="Excluir esta aba (e seus submenus)?" className="ml-auto !px-3">Excluir</ConfirmButton>}
              </div>
            </form>
          ) : (
            <div className="text-sm text-slate-500 border border-dashed rounded-xl p-8 text-center">Selecione uma aba para editar ou crie uma nova.</div>
          )}
        </div>
      </div>
    </div>
  );
}
