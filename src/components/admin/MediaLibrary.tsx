"use client";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { updateMedia, deleteMedia, createFolder, deleteFolder } from "@/app/admin/(panel)/midia/actions";
import { Button, Input, Card, Field, Select, Alert } from "./ui";
import type { Media } from "@/lib/types";
import { Upload, Search, Trash2, Copy, Loader2, FolderPlus } from "lucide-react";

type Folder = { id: string; name: string };

export function MediaLibrary({ folders, canManage }: { folders: Folder[]; canManage: boolean }) {
  const [items, setItems] = useState<Media[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("");
  const [selected, setSelected] = useState<Media | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const p = new URLSearchParams({ q, page: String(page) });
    if (folder) p.set("folder", folder);
    const r = await fetch(`/api/media?${p}`);
    const d = await r.json();
    setItems(d.items ?? []);
    setTotal(d.total ?? 0);
  }, [q, page, folder]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    let ok = 0;
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
      if (folder && folder !== "root") fd.append("folder_id", folder);
      const r = await fetch("/api/media/upload", { method: "POST", body: fd });
      if (r.ok) ok++;
      else setMsg({ kind: "error", text: (await r.json()).error ?? "Erro" });
    }
    setUploading(false);
    if (ok) setMsg({ kind: "success", text: `${ok} arquivo(s) enviado(s).` });
    load();
  };

  return (
    <div className="space-y-4">
      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative"><Search className="h-4 w-4 absolute left-2.5 top-2.5 text-slate-400" /><Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Pesquisar" className="!pl-8 !w-56" /></div>
        <Select value={folder} onChange={(e) => { setFolder(e.target.value); setPage(1); }} className="!w-48">
          <option value="">Todas as pastas</option><option value="root">Sem pasta</option>
          {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </Select>
        {canManage && (
          <form action={createFolder} className="flex gap-1">
            <Input name="name" placeholder="Nova pasta" className="!w-36" required />
            <Button variant="secondary" type="submit"><FolderPlus className="h-4 w-4" /></Button>
          </form>
        )}
        <input ref={fileRef} type="file" multiple accept="image/*,audio/*,.pdf" className="hidden" onChange={(e) => upload(e.target.files)} />
        <Button className="ml-auto" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Enviar arquivos</Button>
      </div>
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}>
          {!items.length ? (
            <div className="border-2 border-dashed rounded-xl p-16 text-center text-slate-500 text-sm">Arraste arquivos aqui ou clique em “Enviar arquivos”.</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {items.map((m) => (
                <button key={m.id} type="button" onClick={() => setSelected(m)} className={`aspect-square rounded-lg overflow-hidden border-2 bg-slate-100 ${selected?.id === m.id ? "border-slate-900" : "border-transparent hover:border-slate-300"}`}>
                  {m.mime_type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.alt ?? ""} className="w-full h-full object-cover" loading="lazy" />
                  ) : <div className="h-full flex items-center justify-center text-xs p-2 break-all text-slate-500">{m.filename}</div>}
                </button>
              ))}
            </div>
          )}
          {total > 40 && (
            <div className="flex justify-center gap-2 mt-4 text-sm">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Anterior</Button>
              <span className="self-center text-slate-500">{page} / {Math.ceil(total / 40)}</span>
              <Button variant="secondary" disabled={page * 40 >= total} onClick={() => setPage(page + 1)}>Próxima →</Button>
            </div>
          )}
        </div>
        <div>
          {selected ? (
            <Card title="Detalhes">
              <form action={(fd) => start(async () => { const r = await updateMedia(fd); setMsg(r && "error" in r ? { kind: "error", text: r.error! } : { kind: "success", text: "Dados salvos." }); load(); })} className="space-y-3">
                {selected.mime_type.startsWith("image/") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.url} alt="" className="w-full rounded-lg" />
                )}
                <div className="text-xs text-slate-500 break-all">{selected.filename}{selected.width ? ` · ${selected.width}×${selected.height}` : ""} · {(selected.size_bytes / 1024).toFixed(0)} KB</div>
                <div className="flex gap-1"><Input value={selected.url} readOnly className="!text-xs" /><Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(selected.url)} title="Copiar URL"><Copy className="h-4 w-4" /></Button></div>
                <input type="hidden" name="id" value={selected.id} />
                <Field label="Texto alternativo"><Input name="alt" defaultValue={selected.alt ?? ""} key={selected.id + "a"} /></Field>
                <Field label="Legenda"><Input name="caption" defaultValue={selected.caption ?? ""} key={selected.id + "c"} /></Field>
                <Field label="Crédito"><Input name="credit" defaultValue={selected.credit ?? ""} key={selected.id + "r"} /></Field>
                <Field label="Pasta"><Select name="folder_id" defaultValue={selected.folder_id ?? ""} key={selected.id + "f"}><option value="">Sem pasta</option>{folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</Select></Field>
                <div className="flex gap-2"><Button type="submit" disabled={pending}>Salvar</Button>
                  {canManage && <DeleteBtn id={selected.id} onDone={(r) => { setMsg(r.error ? { kind: "error", text: r.error } : { kind: "success", text: "Arquivo excluído." }); if (!r.error) { setSelected(null); load(); } }} />}
                </div>
              </form>
            </Card>
          ) : (
            <div className="text-sm text-slate-500 border border-dashed rounded-xl p-8 text-center">Selecione um arquivo para ver detalhes.</div>
          )}
          {canManage && folders.length > 0 && (
            <Card title="Pastas" className="mt-4">
              <ul className="text-sm divide-y">
                {folders.map((f) => (
                  <li key={f.id} className="py-1.5 flex items-center justify-between">{f.name}
                    <form action={deleteFolder}><input type="hidden" name="id" value={f.id} /><button className="text-slate-400 hover:text-red-600" title="Excluir pasta (arquivos ficam sem pasta)"><Trash2 className="h-3.5 w-3.5" /></button></form>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteBtn({ id, onDone }: { id: string; onDone: (r: { error?: string }) => void }) {
  const [pending, start] = useTransition();
  return (
    <Button type="button" variant="danger" className="ml-auto" disabled={pending} onClick={() => {
      if (!confirm("Excluir arquivo definitivamente?")) return;
      const fd = new FormData(); fd.append("id", id);
      start(async () => onDone((await deleteMedia(fd)) as { error?: string }));
    }}><Trash2 className="h-4 w-4" /></Button>
  );
}
