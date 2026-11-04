import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { AppearanceForm } from "@/components/admin/AppearanceForm";
import type { SiteSettings } from "@/lib/types";

export default async function AppearancePage() {
  await requirePermission("appearance.manage");
  const supabase = await createClient();
  const [{ data: rows }, { data: cats }] = await Promise.all([supabase.from("site_settings").select("key, value"), supabase.from("categories").select("*").order("sort_order")]);
  const settings = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value])) as unknown as SiteSettings;
  return (
    <div>
      <PageHeader title="Personalizar site" description="Logotipo, cores, tipografia, cabeçalho, rodapé e organização da página inicial. As mudanças aparecem no site ao salvar." />
      <AppearanceForm settings={settings} categories={cats ?? []} />
    </div>
  );
}
