"use client";
import type { ActionState } from "@/lib/types";
import { useActionState, useState } from "react";
import { saveShow, deleteShow, saveEpisode, deleteEpisode } from "@/app/admin/(panel)/audiovisual/actions";
import { ImageField } from "./MediaPicker";
import { Field, Input, Textarea, Select, Checkbox, SubmitButton, Button, ConfirmButton, Alert, Table, thCls, tdCls, Badge } from "./ui";
import type { Episode, Show } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Pencil, Plus } from "lucide-react";

export function AudiovisualManager({ tab, shows, episodes, editId }: { tab: "episodios" | "programas"; shows: Show[]; episodes: Episode[]; editId?: string }) {
  return tab === "programas" ? <Shows shows={shows} /> : <Episodes shows={shows} episodes={episodes} editId={editId} />;
}

function Shows({ shows }: { shows: Show[] }) {
  const [editing, setEditing] = useState<Partial<Show> | null>(null);
  const [state, action] = useActionState<ActionState, FormData>(saveShow, {});
  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-3">
        <div className="flex justify-end"><Button onClick={() => setEditing({ type: "podcast", is_active: true })}><Plus className="h-4 w-4" /> Novo programa</Button></div>
        <Table>
          <thead><tr><th className={thCls}>Nome</th><th className={thCls}>Tipo</th><th className={thCls}></th></tr></thead>
          <tbody>
            {shows.map((s) => (
              <tr key={s.id}><td className={tdCls}>{s.name}</td><td className={tdCls}>{s.type === "podcast" ? "Podcast" : "Vídeo"}</td><td className={tdCls}><button onClick={() => setEditing(s)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="h-4 w-4" /></button></td></tr>
            ))}
            {!shows.length && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Nenhum programa.</td></tr>}
          </tbody>
        </Table>
      </div>
      <div className="lg:col-span-2">
        {editing && (
          <form action={action} className="bg-white border rounded-xl p-5 space-y-3">
            {state.error && <Alert kind="error">{state.error}</Alert>}
            <input type="hidden" name="id" value={editing.id ?? ""} />
            <Field label="Nome"><Input name="name" defaultValue={editing.name} required /></Field>
            <Field label="Tipo"><Select name="type" defaultValue={editing.type}><option value="podcast">Podcast</option><option value="video">Programa de vídeo</option></Select></Field>
            <Field label="Descrição"><Textarea name="description" defaultValue={editing.description ?? ""} /></Field>
            <ImageField name="cover_url" label="Capa" defaultValue={editing.cover_url} />
            <Checkbox name="is_active" defaultChecked={editing.is_active ?? true} label="Ativo" />
            <div className="flex gap-2"><SubmitButton>Salvar</SubmitButton><Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              {editing.id && <ConfirmButton formAction={deleteShow} message="Excluir programa? Os episódios ficam sem programa." className="ml-auto !px-3">Excluir</ConfirmButton>}</div>
          </form>
        )}
      </div>
    </div>
  );
}

function Episodes({ shows, episodes, editId }: { shows: Show[]; episodes: Episode[]; editId?: string }) {
  const [editing, setEditing] = useState<Partial<Episode> | null>(editId ? episodes.find((e) => e.id === editId) ?? null : null);
  const [type, setType] = useState<"video" | "audio">(editing?.type ?? "video");
  const [state, action] = useActionState<ActionState, FormData>(saveEpisode, {});
  const open = (e: Partial<Episode>) => { setEditing(e); setType(e.type ?? "video"); };
  const dt = editing?.published_at ? new Date(new Date(editing.published_at).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-3">
        <div className="flex justify-end"><Button onClick={() => open({ type: "video", is_published: true })}><Plus className="h-4 w-4" /> Novo episódio</Button></div>
        <Table>
          <thead><tr><th className={thCls}>Título</th><th className={thCls}>Programa</th><th className={thCls}>Data</th><th className={thCls}>Status</th><th className={thCls}></th></tr></thead>
          <tbody>
            {episodes.map((e) => (
              <tr key={e.id}>
                <td className={tdCls}><div className="font-medium line-clamp-1">{e.title}</div>{e.guest_name && <div className="text-xs text-slate-400">com {e.guest_name}</div>}</td>
                <td className={`${tdCls} text-slate-500`}>{(e.show as unknown as { name: string } | null)?.name ?? "—"}</td>
                <td className={`${tdCls} text-xs text-slate-500`}>{formatDate(e.published_at, "short")}</td>
                <td className={tdCls}><Badge color={e.is_published ? "green" : "slate"}>{e.is_published ? "Publicado" : "Oculto"}</Badge></td>
                <td className={tdCls}><button onClick={() => open(e)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="h-4 w-4" /></button></td>
              </tr>
            ))}
            {!episodes.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Nenhum episódio.</td></tr>}
          </tbody>
        </Table>
      </div>
      <div className="lg:col-span-2">
        {editing && (
          <form action={action} className="bg-white border rounded-xl p-5 space-y-3 sticky top-6">
            {state.error && <Alert kind="error">{state.error}</Alert>}
            <input type="hidden" name="id" value={editing.id ?? ""} />
            <Field label="Título"><Input name="title" defaultValue={editing.title} required /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Tipo"><Select name="type" value={type} onChange={(e) => setType(e.target.value as "video" | "audio")}><option value="video">Vídeo</option><option value="audio">Áudio / podcast</option></Select></Field>
              <Field label="Programa"><Select name="show_id" defaultValue={editing.show_id ?? ""}><option value="">— Nenhum —</option>{shows.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
            </div>
            <Field label={type === "video" ? "URL do vídeo (YouTube, Vimeo ou embed)" : "URL de embed (Spotify, SoundCloud…) — opcional"}><Input name="embed_url" defaultValue={editing.embed_url ?? ""} /></Field>
            {type === "audio" && <Field label="Arquivo de áudio (MP3) — URL" hint="Envie pela biblioteca de mídia e cole a URL."><Input name="audio_url" defaultValue={editing.audio_url ?? ""} /></Field>}
            <ImageField name="cover_url" label="Capa do episódio" defaultValue={editing.cover_url} />
            <Field label="Nome do entrevistado"><Input name="guest_name" defaultValue={editing.guest_name ?? ""} /></Field>
            <Field label="Descrição"><Textarea name="description" defaultValue={editing.description ?? ""} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Data de publicação"><Input type="datetime-local" name="published_at" defaultValue={dt} /></Field>
              <Field label="Duração (segundos)"><Input type="number" name="duration_seconds" defaultValue={editing.duration_seconds ?? ""} /></Field>
            </div>
            <Checkbox name="is_published" defaultChecked={editing.is_published ?? true} label="Publicado" />
            <div className="flex gap-2 pt-2"><SubmitButton>Salvar</SubmitButton><Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              {editing.id && <ConfirmButton formAction={deleteEpisode} message="Excluir episódio?" className="ml-auto !px-3">Excluir</ConfirmButton>}</div>
          </form>
        )}
      </div>
    </div>
  );
}
