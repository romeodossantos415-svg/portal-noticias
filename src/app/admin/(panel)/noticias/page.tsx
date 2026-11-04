import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getPermissions } from "@/lib/auth";
import { PageHeader, LinkButton, Table, thCls, tdCls, Badge, Alert, inputCls } from "@/components/admin/ui";
import { STATUS_LABELS, type ArticleStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Plus, Eye, Pencil } from "lucide-react";
import { quickStatus } from "./actions";

const STATUS_COLOR: Record<ArticleStatus, string> = { draft: "slate", review: "yellow", scheduled: "blue", published: "green", archived: "red" };
const PER = 25;

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string; msg?: string; categoria?: string; mine?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const supabase = await createClient();
  const [user, perms] = await Promise.all([getCurrentUser(), getPermissions()]);
  const { data: cats } = await supabase.from("categories").select("id, name").order("sort_order");

  let q = supabase
    .from("articles")
    .select("id, title, slug, status, published_at, scheduled_at, updated_at, view_count, category:categories(name, color), author:profiles!articles_author_id_fkey(full_name)", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * PER, page * PER - 1);
  if (sp.status) q = q.eq("status", sp.status);
  if (sp.categoria) q = q.eq("category_id", sp.categoria);
  if (sp.q) q = q.ilike("title", `%${sp.q}%`);
  if (sp.mine) q = q.or(`author_id.eq.${user!.id},created_by.eq.${user!.id}`);
  const { data: rows, count } = await q;
  const canPublish = perms.has("articles.publish");

  const tabs: { key: string; label: string }[] = [{ key: "", label: "Todas" }, ...(Object.keys(STATUS_LABELS) as ArticleStatus[]).map((k) => ({ key: k, label: STATUS_LABELS[k] }))];

  return (
    <div>
      <PageHeader
        title="Notícias"
        description={`${count ?? 0} matéria(s)`}
        actions={
          <LinkButton href="/admin/noticias/nova">
            <Plus className="h-4 w-4" /> Nova notícia
          </LinkButton>
        }
      />
      {sp.msg && (
        <div className="mb-4">
          <Alert kind="success">{sp.msg}</Alert>
        </div>
      )}
      <form className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {tabs.map((t) => (
            <Link key={t.key} href={`/admin/noticias${t.key ? `?status=${t.key}` : ""}`} className={`px-3 py-1.5 rounded-md text-sm ${(sp.status ?? "") === t.key ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`}>
              {t.label}
            </Link>
          ))}
        </div>
        <input name="q" defaultValue={sp.q} placeholder="Buscar por título" className={`${inputCls} !w-56`} />
        <select name="categoria" defaultValue={sp.categoria} className={`${inputCls} !w-48`}>
          <option value="">Todas as categorias</option>
          {(cats ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" name="mine" value="1" defaultChecked={!!sp.mine} /> Só minhas
        </label>
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <button className="text-sm border border-slate-300 bg-white rounded-lg px-3 py-2">Filtrar</button>
      </form>

      <Table>
        <thead>
          <tr>
            <th className={thCls}>Título</th>
            <th className={thCls}>Categoria</th>
            <th className={thCls}>Autor</th>
            <th className={thCls}>Status</th>
            <th className={thCls}>Data</th>
            <th className={thCls}>Views</th>
            <th className={thCls}></th>
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((a) => {
            const cat = a.category as unknown as { name: string; color: string } | null;
            const author = a.author as unknown as { full_name: string } | null;
            return (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className={tdCls}>
                  <Link href={`/admin/noticias/${a.id}`} className="font-medium hover:underline line-clamp-2 max-w-md">
                    {a.title}
                  </Link>
                </td>
                <td className={tdCls}>{cat ? <span style={{ color: cat.color }} className="text-xs font-semibold uppercase">{cat.name}</span> : "—"}</td>
                <td className={`${tdCls} text-slate-600`}>{author?.full_name ?? "—"}</td>
                <td className={tdCls}><Badge color={STATUS_COLOR[a.status as ArticleStatus]}>{STATUS_LABELS[a.status as ArticleStatus]}</Badge></td>
                <td className={`${tdCls} text-xs text-slate-500 whitespace-nowrap`}>
                  {a.status === "scheduled" ? `Agendada: ${formatDate(a.scheduled_at, "datetime")}` : a.status === "published" ? formatDate(a.published_at, "datetime") : `Editada: ${formatDate(a.updated_at, "datetime")}`}
                </td>
                <td className={`${tdCls} text-slate-500`}>{a.view_count}</td>
                <td className={`${tdCls} whitespace-nowrap`}>
                  <div className="flex items-center gap-1 justify-end">
                    {a.status === "published" && (
                      <Link href={`/noticia/${a.slug}`} target="_blank" className="p-1.5 rounded hover:bg-slate-200" title="Ver no site">
                        <Eye className="h-4 w-4" />
                      </Link>
                    )}
                    <Link href={`/admin/noticias/${a.id}`} className="p-1.5 rounded hover:bg-slate-200" title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {canPublish && a.status === "review" && (
                      <form action={quickStatus}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="published" />
                        <button className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Aprovar</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {!rows?.length && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-slate-500">Nenhuma matéria encontrada.</td>
            </tr>
          )}
        </tbody>
      </Table>
      {(count ?? 0) > PER && (
        <div className="flex justify-center gap-2 mt-4 text-sm">
          {page > 1 && <Link href={`?${new URLSearchParams({ ...sp, page: String(page - 1) })}`} className="px-3 py-1.5 border rounded bg-white">← Anterior</Link>}
          <span className="px-3 py-1.5 text-slate-500">Página {page} de {Math.ceil((count ?? 0) / PER)}</span>
          {page * PER < (count ?? 0) && <Link href={`?${new URLSearchParams({ ...sp, page: String(page + 1) })}`} className="px-3 py-1.5 border rounded bg-white">Próxima →</Link>}
        </div>
      )}
    </div>
  );
}
