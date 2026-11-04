"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, Upload, Search, Loader2 } from "lucide-react";
import type { Media } from "@/lib/types";

type Folder = { id: string; name: string; parent_id: string | null };

export function MediaPicker({ onSelect, onClose }: { onSelect: (m: Media) => void; onClose: () => void }) {
  const [items, setItems] = useState<Media[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folder, setFolder] = useState<string>("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Media | null>(null);
  const [meta, setMeta] = useState({ alt: "", caption: "", credit: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ q });
    if (folder) params.set("folder", folder);
    const res = await fetch(`/api/media?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setFolders(data.folders ?? []);
    setLoading(false);
  }, [q, folder]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
      if (folder && folder !== "root") fd.append("folder_id", folder);
      fd.append("alt", meta.alt);
      fd.append("caption", meta.caption);
      fd.append("credit", meta.credit);
      const res = await fetch("/api/media/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Erro no upload");
      else setSelected(data);
    }
    setUploading(false);
    load();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="font-semibold">Biblioteca de mídia</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-wrap gap-2 px-5 py-3 border-b bg-slate-50 items-center">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar arquivos" className="border rounded-lg pl-8 pr-3 py-2 text-sm w-56" />
          </div>
          <select value={folder} onChange={(e) => setFolder(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Todas as pastas</option>
            <option value="root">Sem pasta</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <div className="ml-auto flex gap-2 items-center">
            <input ref={fileRef} type="file" accept="image/*,audio/*,.pdf" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-lg px-3 py-2 text-sm disabled:opacity-50">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Enviar arquivos
            </button>
          </div>
        </div>
        {error && <div className="px-5 py-2 text-sm text-red-600 bg-red-50">{error}</div>}
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-4" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}>
            {loading && !items.length ? (
              <div className="text-sm text-slate-500 p-8 text-center">Carregando…</div>
            ) : !items.length ? (
              <div className="text-sm text-slate-500 p-8 text-center border-2 border-dashed rounded-xl">Nenhum arquivo. Arraste imagens aqui ou clique em “Enviar arquivos”.</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {items.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setSelected(m)}
                    onDoubleClick={() => onSelect(m)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-slate-100 ${selected?.id === m.id ? "border-slate-900" : "border-transparent hover:border-slate-300"}`}
                  >
                    {m.mime_type.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt={m.alt ?? ""} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-slate-500 p-2 break-all">{m.filename}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-64 border-l p-4 text-sm space-y-3 overflow-y-auto hidden md:block">
            {selected ? (
              <>
                {selected.mime_type.startsWith("image/") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.url} alt="" className="w-full rounded-lg" />
                )}
                <div className="text-xs text-slate-500 break-all">{selected.filename}</div>
                {selected.width && <div className="text-xs text-slate-500">{selected.width}×{selected.height} · {(selected.size_bytes / 1024).toFixed(0)} KB</div>}
                {selected.alt && <div><span className="text-slate-500">Alt:</span> {selected.alt}</div>}
                {selected.credit && <div><span className="text-slate-500">Crédito:</span> {selected.credit}</div>}
                <button type="button" onClick={() => onSelect(selected)} className="w-full bg-slate-900 text-white rounded-lg py-2 font-medium">Usar este arquivo</button>
              </>
            ) : (
              <>
                <p className="text-slate-500 text-xs">Preencha antes de enviar (opcional):</p>
                <input placeholder="Texto alternativo" value={meta.alt} onChange={(e) => setMeta({ ...meta, alt: e.target.value })} className="w-full border rounded px-2 py-1.5" />
                <input placeholder="Legenda" value={meta.caption} onChange={(e) => setMeta({ ...meta, caption: e.target.value })} className="w-full border rounded px-2 py-1.5" />
                <input placeholder="Crédito (fotógrafo/agência)" value={meta.credit} onChange={(e) => setMeta({ ...meta, credit: e.target.value })} className="w-full border rounded px-2 py-1.5" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Campo de formulário: URL de imagem com botão para escolher na biblioteca. */
export function ImageField({ name, label, defaultValue, onPick }: { name: string; label: string; defaultValue?: string | null; onPick?: (m: Media) => void }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  return (
    <div className="text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <div className="mt-1 flex gap-3 items-start">
        <div className="w-28 h-20 bg-slate-100 rounded-lg overflow-hidden border shrink-0 flex items-center justify-center text-xs text-slate-400">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="w-full h-full object-cover" />
          ) : (
            "sem imagem"
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL da imagem" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(true)} className="text-xs border rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50">Escolher da biblioteca</button>
            {url && <button type="button" onClick={() => setUrl("")} className="text-xs text-red-600 px-2">Remover</button>}
          </div>
        </div>
      </div>
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onSelect={(m) => {
            setUrl(m.url);
            onPick?.(m);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
