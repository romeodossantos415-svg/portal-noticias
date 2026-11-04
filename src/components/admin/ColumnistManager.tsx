"use client";
import type { ActionState } from "@/lib/types";
import { useActionState, useState, useTransition } from "react";
import { saveColumnist, deleteColumnist, reorderColumnists } from "@/app/admin/(panel)/colunistas/actions";
import { SortableList } from "./SortableList";
import { ImageField } from "./MediaPicker";
import { Field, Input, Textarea, Select, Checkbox, SubmitButton, Button, ConfirmButton, Alert } from "./ui";
import type { Columnist } from "@/lib/types";
import { Pencil, Plus } from "lucide-react";

export function ColumnistManager({ columnists, profiles, editId }: { columnists: Columnist[]; profiles: { id: string; full_name: string }[]; editId?: string }) {
  const [items, setItems] = useState(columnists);
  const [editing, setEditing] = useState<Partial<Columnist> | null>(editId ? columnists.find((c) => c.id === editId) ?? null : null);
  const [state, action] = useActionState<ActionState, FormData>(saveColumnist, {});
  const [pending, start] = useTransition();
  const dirty = items.map((i) => i.id).join() !== columnists.map((i) => i.id).join();
  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-3">
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={!dirty || pending} onClick={() => start(async () => { await reorderColumnists(items.map((i) => i.id)); })}>{pending ? "Salvando…" : "Salvar ordem"}</Button>
          <Button onClick={() => setEditing({ is_active: true, social_links: {} })}><Plus className="h-4 w-4" /> Novo colunista</Button>
        </div>
        {!items.length && <p className="text-sm text-slate-500 border border-dashed rounded-xl p-6 text-center">Nenhum colunista cadastrado.</p>}
        <SortableList items={items} onChange={setItems} render={(c) => (
          <div className="flex items-center gap-3 text-sm">
            {c.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : <span className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-bold">{c.name[0]}</span>}
            <div className="flex-1 min-w-0"><div className="font-medium">{c.name}</div><div className="text-xs text-slate-400">{c.specialty}</div></div>
            {!c.is_active && <span className="text-xs bg-slate-100 px-2 rounded">inativo</span>}
            <button type="button" onClick={() => setEditing(c)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="h-4 w-4" /></button>
          </div>
        )} />
      </div>
      <div className="lg:col-span-2">
        {editing ? (
          <form action={action} className="bg-white border rounded-xl p-5 space-y-3 sticky top-6">
            {state.error && <Alert kind="error">{state.error}</Alert>}
            <h3 className="font-semibold">{editing.id ? "Editar colunista" : "Novo colunista"}</h3>
            <input type="hidden" name="id" value={editing.id ?? ""} />
            <Field label="Nome"><Input name="name" defaultValue={editing.name} required /></Field>
            <Field label="Especialidade" hint="Ex.: Política, Economia, Cultura"><Input name="specialty" defaultValue={editing.specialty ?? ""} /></Field>
            <ImageField name="photo_url" label="Fotografia" defaultValue={editing.photo_url} />
            <Field label="Biografia"><Textarea name="bio" defaultValue={editing.bio ?? ""} /></Field>
            <Field label="Vincular a um usuário do painel (opcional)">
              <Select name="profile_id" defaultValue={editing.profile_id ?? ""}>
                <option value="">— Nenhum —</option>
                {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              {["instagram", "x", "facebook", "youtube", "linkedin", "tiktok"].map((k) => (
                <Input key={k} name={`s_${k}`} placeholder={k} defaultValue={editing.social_links?.[k] ?? ""} />
              ))}
            </div>
            <Checkbox name="is_active" defaultChecked={editing.is_active ?? true} label="Ativo" />
            <div className="flex gap-2 pt-2">
              <SubmitButton>Salvar</SubmitButton>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              {editing.id && <ConfirmButton formAction={deleteColumnist} message="Excluir colunista? As matérias ficam, mas sem vínculo." className="ml-auto !px-3">Excluir</ConfirmButton>}
            </div>
          </form>
        ) : <div className="text-sm text-slate-500 border border-dashed rounded-xl p-8 text-center">Selecione um colunista ou crie um novo.</div>}
      </div>
    </div>
  );
}
