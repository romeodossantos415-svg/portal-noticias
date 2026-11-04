"use client";
import { useState, useTransition } from "react";
import { SortableList } from "./SortableList";
import { saveSettings } from "@/app/admin/(panel)/personalizar/actions";
import { Button, Card, Select } from "./ui";
import { HOME_BLOCK_LABELS, AD_POSITION_LABELS, type Category, type HomeBlock, type AdPosition } from "@/lib/types";
import { Trash2, Plus } from "lucide-react";

type Row = HomeBlock & { id: string };
const uid = () => Math.random().toString(36).slice(2, 9);

export function HomeLayoutEditor({ initial, categories }: { initial: HomeBlock[]; categories: Category[] }) {
  const [rows, setRows] = useState<Row[]>(initial.map((b) => ({ ...b, id: uid() })));
  const [adding, setAdding] = useState<HomeBlock["type"]>("category");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");

  const add = () => {
    const base: HomeBlock =
      adding === "category" ? { type: "category", category_id: categories[0]?.id ?? "", layout: "grid", limit: 4 } : adding === "ad" ? { type: "ad", position: "between_sections" } : ({ type: adding } as HomeBlock);
    setRows([...rows, { ...base, id: uid() }]);
  };
  const update = (id: string, patch: Partial<Row>) => setRows(rows.map((r) => (r.id === id ? ({ ...r, ...patch } as Row) : r)));
  const save = () =>
    start(async () => {
      const blocks = rows.map(({ id: _id, ...b }) => b);
      const r = await saveSettings("home_layout", { blocks });
      setMsg("error" in r ? `Erro: ${r.error}` : "Organização da página inicial salva.");
      setTimeout(() => setMsg(""), 3000);
    });

  return (
    <Card title="Organização dos blocos da página inicial">
      <p className="text-sm text-slate-500 mb-4">Arraste para mudar a ordem. Você pode adicionar blocos de editorias específicas, espaços publicitários e remover seções. “Blocos por editoria” mostra automaticamente todas as categorias marcadas como “Exibir na home”.</p>
      <SortableList
        items={rows}
        onChange={setRows}
        render={(r) => (
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium">{HOME_BLOCK_LABELS[r.type]}</span>
            {r.type === "category" && (
              <>
                <Select value={r.category_id} onChange={(e) => update(r.id, { category_id: e.target.value })} className="!w-44 !py-1">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <Select value={r.layout ?? "grid"} onChange={(e) => update(r.id, { layout: e.target.value })} className="!w-36 !py-1">
                  <option value="grid">Grade</option><option value="featured">Destaque + lista</option><option value="list">Lista</option>
                </Select>
                <input type="number" min={1} max={12} value={r.limit ?? 4} onChange={(e) => update(r.id, { limit: Number(e.target.value) })} className="w-16 border rounded px-2 py-1" />
              </>
            )}
            {r.type === "ad" && (
              <Select value={r.position} onChange={(e) => update(r.id, { position: e.target.value as AdPosition })} className="!w-52 !py-1">
                {(Object.keys(AD_POSITION_LABELS) as AdPosition[]).map((p) => <option key={p} value={p}>{AD_POSITION_LABELS[p]}</option>)}
              </Select>
            )}
            <button type="button" onClick={() => setRows(rows.filter((x) => x.id !== r.id))} className="ml-auto text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
          </div>
        )}
      />
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <Select value={adding} onChange={(e) => setAdding(e.target.value as HomeBlock["type"])} className="!w-72">
          {(Object.keys(HOME_BLOCK_LABELS) as HomeBlock["type"][]).map((k) => <option key={k} value={k}>{HOME_BLOCK_LABELS[k]}</option>)}
        </Select>
        <Button type="button" variant="secondary" onClick={add}><Plus className="h-4 w-4" /> Adicionar bloco</Button>
        <Button type="button" onClick={save} disabled={pending} className="ml-auto">{pending ? "Salvando…" : "Salvar organização"}</Button>
      </div>
      {msg && <p className="text-sm mt-2 text-emerald-700">{msg}</p>}
    </Card>
  );
}
