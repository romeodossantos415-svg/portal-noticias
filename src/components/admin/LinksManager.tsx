"use client";
import type { ActionState } from "@/lib/types";
import { useActionState, useState, useTransition } from "react";
import { saveLink, deleteLink, reorderLinks } from "@/app/admin/(panel)/links/actions";
import { SortableList } from "./SortableList";
import { Field, Input, Select, Checkbox, SubmitButton, Button, ConfirmButton, Alert, Card } from "./ui";
import type { LinkButton } from "@/lib/types";
import { Pencil, Plus } from "lucide-react";

export function LinksManager({ links }: { links: LinkButton[] }) {
  const [items, setItems] = useState(links);
  const [editing, setEditing] = useState<Partial<LinkButton> | null>(null);
  const [state, action] = useActionState<ActionState, FormData>(saveLink, {});
  const [pending, start] = useTransition();
  const dirty = items.map((i) => i.id).join() !== links.map((i) => i.id).join();
  return (
    <Card title="Botões">
      <div className="flex justify-end gap-2 mb-3">
        <Button variant="secondary" disabled={!dirty || pending} onClick={() => start(async () => { await reorderLinks(items.map((i) => i.id)); })}>{pending ? "Salvando…" : "Salvar ordem"}</Button>
        <Button onClick={() => setEditing({ style: "default", is_active: true })}><Plus className="h-4 w-4" /> Novo botão</Button>
      </div>
      <SortableList items={items} onChange={setItems} render={(l) => (
        <div className="flex items-center gap-3 text-sm"><span className="font-medium flex-1">{l.label}</span><span className="text-xs text-slate-400 truncate max-w-48">{l.url}</span>{!l.is_active && <span className="text-xs bg-slate-100 px-2 rounded">oculto</span>}<button type="button" onClick={() => setEditing(l)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="h-4 w-4" /></button></div>
      )} />
      {editing && (
        <form action={action} className="border rounded-xl p-4 mt-4 space-y-3 bg-slate-50">
          {state.error && <Alert kind="error">{state.error}</Alert>}
          <input type="hidden" name="id" value={editing.id ?? ""} />
          <Field label="Texto do botão"><Input name="label" defaultValue={editing.label} required /></Field>
          <Field label="Link" hint="Matéria (/noticia/slug), WhatsApp (https://wa.me/55…), vídeo, podcast ou qualquer URL"><Input name="url" defaultValue={editing.url} required /></Field>
          <Field label="Estilo"><Select name="style" defaultValue={editing.style}><option value="default">Claro</option><option value="primary">Cor principal</option><option value="dark">Escuro</option></Select></Field>
          <Checkbox name="is_active" defaultChecked={editing.is_active ?? true} label="Visível" />
          <div className="flex gap-2"><SubmitButton>Salvar</SubmitButton><Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
            {editing.id && <ConfirmButton formAction={deleteLink} message="Excluir botão?" className="ml-auto !px-3">Excluir</ConfirmButton>}</div>
        </form>
      )}
    </Card>
  );
}
