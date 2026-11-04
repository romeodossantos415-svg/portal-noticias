import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { PageHeader, Card, Checkbox, Input, Select, SubmitButton } from "@/components/admin/ui";
import { FeaturedManager } from "@/components/admin/FeaturedManager";
import { updateSlot } from "./actions";
import type { FeaturedSlot } from "@/lib/types";

export default async function FeaturedPage() {
  await requirePermission("featured.manage");
  const supabase = await createClient();
  const [{ data: slots }, { data: items }] = await Promise.all([
    supabase.from("featured_slots").select("*").order("sort_order"),
    supabase.from("featured_items").select("slot_key, sort_order, article:articles(id, title, slug, cover_url, published_at, status, category:categories(name))").order("sort_order"),
  ]);
  const bySlot: Record<string, unknown[]> = {};
  for (const it of items ?? []) {
    const a = it.article as unknown as { id: string; status: string } | null;
    if (!a) continue;
    (bySlot[it.slot_key] ??= []).push(a);
  }

  return (
    <div>
      <PageHeader title="Gerenciar destaques" description="Escolha quais matérias publicadas aparecem em cada área da página inicial. Arraste para reordenar. Remover um destaque não exclui a matéria." />
      <div className="space-y-6">
        {(slots ?? []).map((slot: FeaturedSlot) => (
          <div key={slot.key} className="space-y-2">
            <FeaturedManager slot={slot} initial={(bySlot[slot.key] ?? []) as never} />
            <details className="text-xs text-slate-500 px-2">
              <summary className="cursor-pointer">Configurações do bloco “{slot.label}”</summary>
              <form action={updateSlot} className="flex flex-wrap items-end gap-3 mt-2 bg-white border rounded-lg p-3">
                <input type="hidden" name="key" value={slot.key} />
                <Checkbox name="is_active" defaultChecked={slot.is_active} label="Ativo" />
                <label className="text-xs">
                  Máximo de itens
                  <Input type="number" name="max_items" min={1} max={20} defaultValue={slot.max_items} className="!w-20" />
                </label>
                <label className="text-xs">
                  Estilo
                  <Select name="style" defaultValue={slot.style} className="!w-36">
                    <option value="default">Padrão</option>
                    <option value="hero">Manchete</option>
                    <option value="grid">Grade</option>
                    <option value="list">Lista</option>
                    <option value="ticker">Faixa</option>
                    <option value="banner">Banner</option>
                  </Select>
                </label>
                <SubmitButton variant="secondary" className="!py-1.5 !text-xs">Salvar</SubmitButton>
              </form>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
