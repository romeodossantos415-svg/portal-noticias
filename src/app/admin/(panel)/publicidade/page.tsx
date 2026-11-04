import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { PageHeader, Alert } from "@/components/admin/ui";
import { AdsManager } from "@/components/admin/AdsManager";
import type { Ad } from "@/lib/types";

export default async function AdsAdmin({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requirePermission("ads.manage");
  const { msg } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("ads").select("*").order("position").order("sort_order");
  return (
    <div>
      <PageHeader title="Publicidade" description="Banners por posição, com período de veiculação. Para Google AdSense, cole o código do bloco em “Código HTML” ou configure o client em Configurações." />
      {msg && <div className="mb-4"><Alert kind="success">{msg}</Alert></div>}
      <AdsManager ads={(data ?? []) as Ad[]} />
    </div>
  );
}
