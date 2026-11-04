import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, Field, Input, Textarea } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { SiteSettings } from "@/lib/types";

export default async function SettingsPage() {
  await requirePermission("settings.manage");
  const supabase = await createClient();
  const { data: rows } = await supabase.from("site_settings").select("key, value");
  const s = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value])) as unknown as SiteSettings;
  return (
    <div>
      <PageHeader title="Configurações" description="SEO padrão, Google Search Console, Google Analytics e AdSense." />
      <SettingsForm>
        <Card title="SEO padrão">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Título padrão do site"><Input name="seo.default_title" defaultValue={s.seo.default_title} /></Field>
            <Field label="Modelo de título das páginas" hint="%s é substituído pelo título da página."><Input name="seo.title_template" defaultValue={s.seo.title_template} /></Field>
            <Field label="Descrição padrão" className="md:col-span-2"><Textarea name="seo.default_description" defaultValue={s.seo.default_description} className="!min-h-16" /></Field>
          </div>
        </Card>
        <Card title="Integrações Google" className="mt-4">
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="Search Console — código de verificação" hint="Conteúdo da meta tag google-site-verification."><Input name="seo.google_site_verification" defaultValue={s.seo.google_site_verification} /></Field>
            <Field label="Google Analytics — ID de medição" hint="Ex.: G-XXXXXXXXXX"><Input name="seo.ga_measurement_id" defaultValue={s.seo.ga_measurement_id} /></Field>
            <Field label="Google AdSense — client" hint="Ex.: ca-pub-0000000000000000"><Input name="seo.adsense_client" defaultValue={s.seo.adsense_client} /></Field>
          </div>
          <p className="text-xs text-slate-500 mt-3">Sitemap: <code>/sitemap.xml</code> · Robots: <code>/robots.txt</code> · RSS: <code>/feed.xml</code>. Envie o sitemap no Google Search Console após verificar o domínio.</p>
        </Card>
      </SettingsForm>
    </div>
  );
}
