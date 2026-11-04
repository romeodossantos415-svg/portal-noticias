import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { PageHeader, Table, thCls, tdCls } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePermission("logs.view");
  const { page: p } = await searchParams;
  const page = Math.max(1, Number(p ?? 1));
  const supabase = await createClient();
  const { data, count } = await supabase.from("activity_log").select("*, user:profiles(full_name, email)", { count: "exact" }).order("created_at", { ascending: false }).range((page - 1) * 50, page * 50 - 1);
  return (
    <div>
      <PageHeader title="Registro de atividades" description={`${count ?? 0} registro(s)`} />
      <Table>
        <thead><tr><th className={thCls}>Quando</th><th className={thCls}>Usuário</th><th className={thCls}>Ação</th><th className={thCls}>Detalhes</th></tr></thead>
        <tbody>
          {(data ?? []).map((l) => {
            const u = l.user as unknown as { full_name: string; email: string } | null;
            return (
              <tr key={l.id}>
                <td className={`${tdCls} text-xs text-slate-500 whitespace-nowrap`}>{formatDate(l.created_at, "datetime")}</td>
                <td className={tdCls}>{u?.full_name ?? "Sistema"}<div className="text-xs text-slate-400">{u?.email}</div></td>
                <td className={tdCls}><strong>{l.action}</strong> {l.entity_type}</td>
                <td className={`${tdCls} text-xs text-slate-500 font-mono`}>{JSON.stringify(l.details)}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {(count ?? 0) > 50 && (
        <div className="flex justify-center gap-3 mt-4 text-sm">
          {page > 1 && <a href={`?page=${page - 1}`} className="underline">← Anterior</a>}
          {page * 50 < (count ?? 0) && <a href={`?page=${page + 1}`} className="underline">Próxima →</a>}
        </div>
      )}
    </div>
  );
}
