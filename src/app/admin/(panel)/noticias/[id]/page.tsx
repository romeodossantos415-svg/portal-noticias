import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, ConfirmButton } from "@/components/admin/ui";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { loadFormDeps } from "../_data";
import { deleteArticle, restoreVersion } from "../actions";
import { formatDate } from "@/lib/utils";
import { getPermissions } from "@/lib/auth";
import type { Article } from "@/lib/types";

export default async function EditArticlePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const { id } = await params;
  const { msg } = await searchParams;
  const supabase = await createClient();
  const [deps, perms, { data: article }, { data: tagRows }, { data: versions }] = await Promise.all([
    loadFormDeps(),
    getPermissions(),
    supabase.from("articles").select("*").eq("id", id).maybeSingle(),
    supabase.from("article_tags").select("tag:tags(name)").eq("article_id", id),
    supabase.from("article_versions").select("id, version_number, created_at, title, editor:profiles(full_name)").eq("article_id", id).order("version_number", { ascending: false }).limit(20),
  ]);
  if (!article) notFound();
  const tags = (tagRows ?? []).map((r) => (r.tag as unknown as { name: string } | null)?.name).filter(Boolean) as string[];

  return (
    <div>
      <PageHeader
        title="Editar notícia"
        actions={
          perms.has("articles.delete") ? (
            <form action={deleteArticle}>
              <input type="hidden" name="id" value={id} />
              <ConfirmButton message="Excluir esta matéria definitivamente? Esta ação não pode ser desfeita.">Excluir</ConfirmButton>
            </form>
          ) : null
        }
      />
      <ArticleForm article={article as Article} tags={tags} {...deps} initialMsg={msg} />
      {(versions?.length ?? 0) > 0 && (
        <Card title="Histórico de versões" className="mt-6">
          <ul className="divide-y text-sm">
            {versions!.map((v) => (
              <li key={v.id} className="py-2 flex items-center gap-3">
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">v{v.version_number}</span>
                <span className="flex-1 truncate">{v.title}</span>
                <span className="text-xs text-slate-500">{(v.editor as unknown as { full_name: string } | null)?.full_name ?? "—"} · {formatDate(v.created_at, "datetime")}</span>
                <form action={restoreVersion}>
                  <input type="hidden" name="id" value={id} />
                  <input type="hidden" name="version_id" value={v.id} />
                  <ConfirmButton variant="secondary" message={`Restaurar a versão ${v.version_number}? O conteúdo atual será guardado como nova versão.`} className="!px-2 !py-1 !text-xs">Restaurar</ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
