import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { PageHeader, LinkButton, Table, thCls, tdCls, Badge, Alert } from "@/components/admin/ui";
import { ROLE_LABELS, type UserRole } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requirePermission("users.manage");
  const { msg } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at");
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  return (
    <div>
      <PageHeader title="Usuários" description="Cada pessoa deve ter seu próprio login. Perfis e permissões individuais são verificados no servidor." actions={<LinkButton href="/admin/usuarios/novo"><Plus className="h-4 w-4" /> Novo usuário</LinkButton>} />
      {msg && <div className="mb-4"><Alert kind="success">{msg}</Alert></div>}
      {!hasKey && <div className="mb-4"><Alert kind="info">Para criar ou convidar usuários pelo painel, configure a variável <code>SUPABASE_SERVICE_ROLE_KEY</code> no servidor (ver manual). Enquanto isso, usuários podem ser criados no painel do Supabase (Authentication → Users).</Alert></div>}
      <Table>
        <thead><tr><th className={thCls}>Nome</th><th className={thCls}>E-mail</th><th className={thCls}>Perfil</th><th className={thCls}>Status</th><th className={thCls}>Criado</th></tr></thead>
        <tbody>
          {(data ?? []).map((u) => (
            <tr key={u.id} className="hover:bg-slate-50">
              <td className={tdCls}>
                <Link href={`/admin/usuarios/${u.id}`} className="font-medium hover:underline flex items-center gap-2">
                  {u.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">{u.full_name?.[0]}</span>
                  )}
                  {u.full_name} {u.username && <span className="text-xs text-slate-400">@{u.username}</span>}
                </Link>
              </td>
              <td className={`${tdCls} text-slate-600`}>{u.email}</td>
              <td className={tdCls}><Badge color={u.role === "master" ? "purple" : u.role === "admin" ? "blue" : "slate"}>{ROLE_LABELS[u.role as UserRole]}</Badge></td>
              <td className={tdCls}><Badge color={u.status === "active" ? "green" : u.status === "blocked" ? "red" : "yellow"}>{{ active: "Ativo", blocked: "Bloqueado", pending: "Pendente" }[u.status as string]}</Badge></td>
              <td className={`${tdCls} text-xs text-slate-500`}>{formatDate(u.created_at, "short")}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
