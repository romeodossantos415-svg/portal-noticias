import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { PageHeader, Alert, Card, Field, Input, Textarea } from "@/components/admin/ui";
import { LinksManager } from "@/components/admin/LinksManager";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ImageField } from "@/components/admin/MediaPicker";
import type { LinkButton, SiteSettings } from "@/lib/types";

export default async function LinksAdmin({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requirePermission("links.manage");
  const { msg } = await searchParams;
  const supabase = await createClient();
  const [{ data: links }, { data: s }] = await Promise.all([supabase.from("link_buttons").select("*").order("sort_order"), supabase.from("site_settings").select("value").eq("key", "links_page").single()]);
  const lp = (s?.value ?? {}) as SiteSettings["links_page"];
  return (
    <div>
      <PageHeader title="Página de links (bio)" description="Página independente em /links para colocar na bio do Instagram, TikTok etc." actions={<a href="/links" target="_blank" className="text-sm underline">Abrir /links</a>} />
      {msg && <div className="mb-4"><Alert kind="success">{msg}</Alert></div>}
      <div className="grid lg:grid-cols-2 gap-6">
        <SettingsForm>
          <Card title="Cabeçalho da página">
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 text-sm"><input type="hidden" name="links_page.__has_enabled" value="1" /><input type="checkbox" name="links_page.enabled" defaultChecked={lp.enabled} /> Página ativa</label>
              <Field label="Título"><Input name="links_page.title" defaultValue={lp.title} /></Field>
              <Field label="Subtítulo / descrição"><Textarea name="links_page.subtitle" defaultValue={lp.subtitle} className="!min-h-16" /></Field>
              <ImageField name="links_page.avatar_url" label="Foto / imagem de perfil" defaultValue={lp.avatar_url} />
              <Field label="Mostrar últimas notícias (quantidade, 0 = nenhuma)"><Input type="number" name="links_page.show_latest_articles" defaultValue={lp.show_latest_articles ?? 3} min={0} max={10} /></Field>
            </div>
          </Card>
        </SettingsForm>
        <LinksManager links={(links ?? []) as LinkButton[]} />
      </div>
    </div>
  );
}
