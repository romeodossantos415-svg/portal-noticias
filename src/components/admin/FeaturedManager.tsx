"use client";
import { useEffect, useState, useTransition } from "react";
import { SortableList } from "./SortableList";
import { setSlotItems, searchPublished } from "@/app/admin/(panel)/destaques/actions";
import { Search, X, Plus, Check } from "lucide-react";
import type { FeaturedSlot } from "@/lib/types";

type Item = { id: string; title: string; slug: string; cover_url: string | null; published_at: string | null; category: { name: string } | null };

export function FeaturedManager({ slot, initial }: { slot: FeaturedSlot; initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState<null | "ok" | "err">(null);
  const dirty = JSON.stringify(items.map((i) => i.id)) !== JSON.stringify(initial.map((i) => i.id));

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => setResults((await searchPublished(q)) as Item[]), 200);
    return () => clearTimeout(t);
  }, [q, open]);

  const save = () =>
    start(async () => {
      const r = await setSlotItems(slot.key, items.map((i) => i.id));
      setSaved(r.ok ? "ok" : "err");
      setTimeout(() => setSaved(null), 2500);
    });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-semibold">{slot.label}</h2>
          <p className="text-xs text-slate-500">{slot.description} · máx. {slot.max_items} {slot.is_active ? "" : "· (desativado)"}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen(!open)} className="inline-flex items-center gap-1 text-sm border rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50">
            <Plus className="h-4 w-4" /> Adicionar
          </button>
          <button type="button" onClick={save} disabled={!dirty || pending} className="inline-flex items-center gap-1 text-sm bg-slate-900 text-white rounded-lg px-3 py-1.5 disabled:opacity-40">
            {saved === "ok" ? <Check className="h-4 w-4" /> : null} {pending ? "Salvando…" : saved === "ok" ? "Salvo" : "Salvar ordem"}
          </button>
        </div>
      </div>
      {saved === "err" && <div className="text-sm text-red-600 mb-2">Erro ao salvar.</div>}
      {open && (
        <div className="border rounded-lg p-3 mb-4 bg-slate-50">
          <div className="relative mb-2">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-slate-400" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar matéria publicada" className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm" />
          </div>
          <ul className="max-h-60 overflow-y-auto divide-y">
            {results
              .filter((r) => !items.some((i) => i.id === r.id))
              .map((r) => (
                <li key={r.id} className="py-2 flex items-center gap-3 text-sm">
                  <Thumb url={r.cover_url} />
                  <span className="flex-1 line-clamp-1">{r.title}</span>
                  <span className="text-xs text-slate-400">{r.category?.name}</span>
                  <button type="button" disabled={items.length >= slot.max_items} onClick={() => { setItems([...items, r]); }} className="text-xs bg-slate-900 text-white px-2 py-1 rounded disabled:opacity-40">
                    Adicionar
                  </button>
                </li>
              ))}
            {!results.length && <li className="py-3 text-xs text-slate-500">Nenhuma matéria publicada encontrada.</li>}
          </ul>
        </div>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 border border-dashed rounded-lg p-4 text-center">Nenhuma matéria selecionada. {slot.key.startsWith("hero") || slot.key === "ticker" ? "O site mostrará as mais recentes automaticamente." : "Este bloco ficará oculto."}</p>
      ) : (
        <SortableList
          items={items}
          onChange={setItems}
          render={(it) => (
            <div className="flex items-center gap-3 text-sm">
              <Thumb url={it.cover_url} />
              <span className="flex-1 line-clamp-1">{it.title}</span>
              <span className="text-xs text-slate-400 hidden md:inline">{it.category?.name}</span>
              <button type="button" onClick={() => setItems(items.filter((i) => i.id !== it.id))} className="text-slate-400 hover:text-red-600 p-1" title="Remover do destaque (não exclui a matéria)">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}

function Thumb({ url }: { url: string | null }) {
  return (
    <div className="h-10 w-14 bg-slate-100 rounded overflow-hidden shrink-0">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover" />
      )}
    </div>
  );
}
