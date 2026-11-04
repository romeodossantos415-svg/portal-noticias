import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { PageHeader, Alert } from "@/components/admin/ui";
import { ColumnistManager } from "@/components/admin/ColumnistManager";

export default async function ColumnistsAdmin({ searchParams }: { searchParams: Promise<{ msg?: string; edit?: string }> }) {
  await requirePermission("columnists.manage");
  const { msg, edit } = await searchParams;
  const supabase = await createClient();
  const [{ data: cols }, { data: profiles }] = await Promise.all([supabase.from("columnists").select("*").order("sort_order"), supabase.from("profiles").select("id, full_name").eq("status", "active").order("full_name")]);
  return (
    <div>
      <PageHeader title="Colunistas" description="Cadastre colunistas com foto, biografia e especialidade. Associe matérias a eles no editor de notícias." />
      {msg && <div className="mb-4"><Alert kind="success">{msg}</Alert></div>}
      <ColumnistManager columnists={cols ?? []} profiles={profiles ?? []} editId={edit} />
    </div>
  );
}
