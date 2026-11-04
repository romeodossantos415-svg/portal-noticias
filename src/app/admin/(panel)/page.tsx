import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getPermissions } from "@/lib/auth";
import { Card, LinkButton, Badge } from "@/components/admin/ui";
import { formatDate, timeAgo } from "@/lib/utils";
import { STATUS_LABELS, type ArticleStatus } from "@/lib/types";
import { FileText, Clock, CalendarClock, Users, Eye, Plus, Star } from "lucide-react";

const STATUS_COLOR: Record<ArticleStatus, string> = { draft: "slate", review: "yellow", scheduled: "blue", published: "green", archived: "red" };

export default async function Dashboard() {
  const supabase = await createClient();
  const [user, perms] = await Promise.all([getCurrentUser(), getPermissions()]);
  const count = (status: string) => supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", status);
  const [pub, draft, sched, review, users, latest, top, log] = await Promise.all([
    count("published"),
    count("draft"),
    count("scheduled"),
    count("review"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("articles").select("id, title, slug, status, updated_at, published_at, author:profiles!articles_author_id_fkey(full_name)").order("updated_at", { ascending: false }).limit(8),
    supabase.from("articles").select("id, title, slug, view_count").eq("status", "published").order("view_count", { ascending: false }).limit(5),
    perms.has("logs.view") ? supabase.from("activity_log").select("*, user:profiles(full_name)").order("created_at", { ascending: false }).limit(8) : Promise.resolve({ data: [] }),
  ]);

  const stats = [
    { label: "Publicadas", value: pub.count ?? 0, icon: FileText, href: "/admin/noticias?status=published" },
    { label: "Rascunhos", value: draft.count ?? 0, icon: Clock, href: "/admin/noticias?status=draft" },
    { label: "Em revisão", value: review.count ?? 0, icon: Eye, href: "/admin/noticias?status=review" },
    { label: "Agendadas", value: sched.count ?? 0, icon: CalendarClock, href: "/admin/noticias?status=scheduled" },
    { label: "Usuários", value: users.count ?? 0, icon: Users, href: "/admin/usuarios" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Olá, {user?.full_name.split(" ")[0]}</h1>
          <p className="text-sm text-slate-500">Resumo do portal</p>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/admin/noticias/nova">
            <Plus className="h-4 w-4" /> Nova notícia
          </LinkButton>
          {perms.has("featured.manage") && (
            <LinkButton href="/admin/destaques" variant="secondary">
              <Star className="h-4 w-4" /> Editar destaques
            </LinkButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-400 transition">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase tracking-wider">{s.label}</span>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold mt-2">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Últimas publicações" className="lg:col-span-2">
          <ul className="divide-y divide-slate-100">
            {(latest.data ?? []).map((a) => (
              <li key={a.id} className="py-2.5 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/noticias/${a.id}`} className="font-medium hover:underline line-clamp-1">
                    {a.title}
                  </Link>
                  <div className="text-xs text-slate-500">
                    {(a.author as unknown as { full_name: string } | null)?.full_name ?? "—"} · {timeAgo(a.updated_at)}
                  </div>
                </div>
                <Badge color={STATUS_COLOR[a.status as ArticleStatus]}>{STATUS_LABELS[a.status as ArticleStatus]}</Badge>
              </li>
            ))}
            {!latest.data?.length && <li className="text-sm text-slate-500 py-4">Nenhuma matéria ainda. Crie a primeira!</li>}
          </ul>
        </Card>
        <div className="space-y-6">
          <Card title="Mais acessadas">
            <ol className="space-y-2">
              {(top.data ?? []).map((a, i) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="font-bold text-slate-300">{i + 1}</span>
                  <Link href={`/noticia/${a.slug}`} target="_blank" className="flex-1 line-clamp-2 hover:underline">
                    {a.title}
                  </Link>
                  <span className="text-slate-400 text-xs whitespace-nowrap">{a.view_count} views</span>
                </li>
              ))}
              {!top.data?.length && <li className="text-sm text-slate-500">Sem dados ainda.</li>}
            </ol>
          </Card>
          {perms.has("logs.view") && (
            <Card title="Atividades recentes">
              <ul className="space-y-2 text-xs">
                {(log.data ?? []).map((l: { id: number; action: string; entity_type: string; created_at: string; user: { full_name: string } | null }) => (
                  <li key={l.id} className="flex justify-between gap-2">
                    <span className="truncate">
                      <strong>{l.user?.full_name ?? "Sistema"}</strong> {l.action} {l.entity_type}
                    </span>
                    <span className="text-slate-400 whitespace-nowrap">{timeAgo(l.created_at)}</span>
                  </li>
                ))}
                {!log.data?.length && <li className="text-slate-500">Nenhuma atividade registrada.</li>}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
