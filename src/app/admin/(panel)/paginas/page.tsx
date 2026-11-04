import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { PageHeader, LinkButton, Table, thCls, tdCls, Badge } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";
import { Plus, Eye } from "lucide-react";

export default async function PagesPage() {
  await requirePermission("pages.manage");
  const supabase = await createClient();
  const { data } = await supabase.from("pages").select("*").order("is_system", { ascending: false }).order("sort_order");
  return (
    <div>
      <PageHeader title="Páginas" description="Sobre, Contato, Expediente, Publicidade, Termos e páginas especiais." actions={<LinkButton href="/admin/paginas/nova"><Plus className="h-4 w-4" /> Nova página</LinkButton>} />
      <Table>
        <thead><tr><th className={thCls}>Título</th><th className={thCls}>URL</th><th className={thCls}>Status</th><th className={thCls}>Atualizada</th><th className={thCls}></th></tr></thead>
        <tbody>
          {(data ?? []).map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className={tdCls}><Link href={`/admin/paginas/${p.id}`} className="font-medium hover:underline">{p.title}</Link> {p.is_system && <span className="text-xs text-slate-400 ml-1">sistema</span>}</td>
              <td className={`${tdCls} text-slate-500`}>/pagina/{p.slug}</td>
              <td className={tdCls}><Badge color={p.is_published ? "green" : "slate"}>{p.is_published ? "Publicada" : "Oculta"}</Badge></td>
              <td className={`${tdCls} text-xs text-slate-500`}>{formatDate(p.updated_at, "datetime")}</td>
              <td className={tdCls}><Link href={`/pagina/${p.slug}`} target="_blank" className="p-1.5 inline-block hover:bg-slate-200 rounded"><Eye className="h-4 w-4" /></Link></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
