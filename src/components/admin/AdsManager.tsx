"use client";
import type { ActionState } from "@/lib/types";
import { useActionState, useState } from "react";
import { saveAd, deleteAd } from "@/app/admin/(panel)/publicidade/actions";
import { ImageField } from "./MediaPicker";
import { Field, Input, Textarea, Select, Checkbox, SubmitButton, Button, ConfirmButton, Alert, Table, thCls, tdCls, Badge } from "./ui";
import { AD_POSITION_LABELS, type Ad, type AdPosition } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Pencil, Plus } from "lucide-react";

const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export function AdsManager({ ads }: { ads: Ad[] }) {
  const [editing, setEditing] = useState<Partial<Ad> | null>(null);
  const [state, action] = useActionState<ActionState, FormData>(saveAd, {});
  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-3">
        <div className="flex justify-end"><Button onClick={() => setEditing({ position: "top", is_active: true })}><Plus className="h-4 w-4" /> Novo anúncio</Button></div>
        <Table>
          <thead><tr><th className={thCls}>Nome</th><th className={thCls}>Posição</th><th className={thCls}>Período</th><th className={thCls}>Cliques</th><th className={thCls}>Status</th><th className={thCls}></th></tr></thead>
          <tbody>
            {ads.map((a) => (
              <tr key={a.id}>
                <td className={`${tdCls} font-medium`}>{a.name}</td>
                <td className={`${tdCls} text-slate-600`}>{AD_POSITION_LABELS[a.position]}</td>
                <td className={`${tdCls} text-xs text-slate-500`}>{a.starts_at || a.ends_at ? `${formatDate(a.starts_at, "short") || "…"} → ${formatDate(a.ends_at, "short") || "…"}` : "Sem limite"}</td>
                <td className={tdCls}>{a.clicks}</td>
                <td className={tdCls}><Badge color={a.is_active ? "green" : "slate"}>{a.is_active ? "Ativo" : "Inativo"}</Badge></td>
                <td className={tdCls}><button onClick={() => setEditing(a)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="h-4 w-4" /></button></td>
              </tr>
            ))}
            {!ads.length && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Nenhum anúncio cadastrado.</td></tr>}
          </tbody>
        </Table>
      </div>
      <div className="lg:col-span-2">
        {editing && (
          <form action={action} className="bg-white border rounded-xl p-5 space-y-3 sticky top-6">
            {state.error && <Alert kind="error">{state.error}</Alert>}
            <input type="hidden" name="id" value={editing.id ?? ""} />
            <Field label="Nome interno"><Input name="name" defaultValue={editing.name} required /></Field>
            <Field label="Posição"><Select name="position" defaultValue={editing.position}>{(Object.keys(AD_POSITION_LABELS) as AdPosition[]).map((p) => <option key={p} value={p}>{AD_POSITION_LABELS[p]}</option>)}</Select></Field>
            <ImageField name="image_url" label="Banner (imagem)" defaultValue={editing.image_url} />
            <Field label="Link de destino"><Input name="link_url" defaultValue={editing.link_url ?? ""} placeholder="https://" /></Field>
            <Field label="Ou código HTML (AdSense, script)" hint="Se preenchido, substitui a imagem."><Textarea name="html_code" defaultValue={editing.html_code ?? ""} className="font-mono text-xs" /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Início"><Input type="datetime-local" name="starts_at" defaultValue={toLocal(editing.starts_at ?? null)} /></Field>
              <Field label="Término"><Input type="datetime-local" name="ends_at" defaultValue={toLocal(editing.ends_at ?? null)} /></Field>
            </div>
            <div className="flex items-center gap-4">
              <Checkbox name="is_active" defaultChecked={editing.is_active ?? true} label="Ativo" />
              <label className="text-sm">Ordem <Input type="number" name="sort_order" defaultValue={editing.sort_order ?? 0} className="!w-20 inline-block ml-1" /></label>
            </div>
            <div className="flex gap-2 pt-2"><SubmitButton>Salvar</SubmitButton><Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              {editing.id && <ConfirmButton formAction={deleteAd} message="Excluir anúncio?" className="ml-auto !px-3">Excluir</ConfirmButton>}</div>
          </form>
        )}
      </div>
    </div>
  );
}
