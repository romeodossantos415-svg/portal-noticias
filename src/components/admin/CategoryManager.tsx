"use client";
import { useState, useTransition } from "react";
import { SortableList } from "./SortableList";
import { reorderCategories, saveCategory, deleteCategory } from "@/app/admin/(panel)/categorias/actions";
import { Field, Input, Textarea, Select, Checkbox, SubmitButton, Button, ConfirmButton } from "./ui";
import { ImageField } from "./MediaPicker";
import type { Category } from "@/lib/types";
import { Pencil, Plus } from "lucide-react";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState(categories);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [pending, start] = useTransition();
  const order = items.map((c) => c.id).join();
  const dirty = order !== categories.map((c) => c.id).join();

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">Arraste para definir a ordem de exibição no site.</p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={!dirty || pending} onClick={() => start(async () => { await reorderCategories(items.map((c) => c.id)); })}>
              {pending ? "Salvando…" : "Salvar ordem"}
            </Button>
            <Button onClick={() => setEditing({ is_active: true, show_on_home: true, home_layout: "grid", home_limit: 4, color: "#111827" })}>
              <Plus className="h-4 w-4" /> Nova categoria
            </Button>
          </div>
        </div>
        <SortableList
          items={items}
          onChange={setItems}
          render={(c) => (
            <div className="flex items-center gap-3 text-sm">
              <span className="h-4 w-4 rounded-full shrink-0" style={{ background: c.color ?? "#111" }} />
              <span className="font-medium flex-1">{c.name}</span>
              <span className="text-xs text-slate-400">/{c.slug}</span>
              {!c.is_active && <span className="text-xs bg-slate-100 px-2 rounded">inativa</span>}
              {!c.show_on_home && <span className="text-xs bg-slate-100 px-2 rounded">fora da home</span>}
              <button type="button" onClick={() => setEditing(c)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="h-4 w-4" /></button>
            </div>
          )}
        />
      </div>
      <div className="lg:col-span-2">
        {editing ? (
          <form action={async (fd) => { await saveCategory(fd); setEditing(null); }} className="bg-white border rounded-xl p-5 space-y-3 sticky top-6">
            <h3 className="font-semibold">{editing.id ? "Editar categoria" : "Nova categoria"}</h3>
            <input type="hidden" name="id" value={editing.id ?? ""} />
            <Field label="Nome"><Input name="name" defaultValue={editing.name} required /></Field>
            <Field label="Slug (URL)" hint="Deixe vazio para gerar automaticamente."><Input name="slug" defaultValue={editing.slug} /></Field>
            <Field label="Descrição"><Textarea name="description" defaultValue={editing.description ?? ""} className="!min-h-16" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cor"><input type="color" name="color" defaultValue={editing.color ?? "#111827"} className="h-10 w-full border rounded-lg" /></Field>
              <Field label="Categoria pai">
                <Select name="parent_id" defaultValue={editing.parent_id ?? ""}>
                  <option value="">— Nenhuma —</option>
                  {categories.filter((c) => c.id !== editing.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
            </div>
            <ImageField name="image_url" label="Imagem da editoria" defaultValue={editing.image_url} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Layout na home">
                <Select name="home_layout" defaultValue={editing.home_layout ?? "grid"}>
                  <option value="grid">Grade (4 colunas)</option>
                  <option value="featured">Destaque + lista</option>
                  <option value="list">Lista (2 colunas)</option>
                </Select>
              </Field>
              <Field label="Qtd. de notícias na home"><Input type="number" name="home_limit" min={1} max={12} defaultValue={editing.home_limit ?? 4} /></Field>
            </div>
            <div className="flex gap-4">
              <Checkbox name="is_active" defaultChecked={editing.is_active ?? true} label="Ativa" />
              <Checkbox name="show_on_home" defaultChecked={editing.show_on_home ?? true} label="Exibir bloco na home" />
            </div>
            <div className="flex gap-2 pt-2">
              <SubmitButton>Salvar</SubmitButton>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              {editing.id && (
                <ConfirmButton formAction={deleteCategory} message="Excluir esta categoria? As matérias dela ficarão sem categoria." className="ml-auto !px-3">Excluir</ConfirmButton>
              )}
            </div>
          </form>
        ) : (
          <div className="text-sm text-slate-500 border border-dashed rounded-xl p-8 text-center">Selecione uma categoria para editar ou crie uma nova.</div>
        )}
      </div>
    </div>
  );
}
