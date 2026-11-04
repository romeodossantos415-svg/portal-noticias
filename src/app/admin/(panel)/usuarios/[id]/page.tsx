import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, requireUser } from "@/lib/auth";
import { PageHeader, ConfirmButton, Button } from "@/components/admin/ui";
import { UserForm } from "@/components/admin/UserForm";
import { deleteUser, revokeSessions, sendReset } from "../actions";
import type { Profile } from "@/lib/types";

export default async function UserPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  await requirePermission("users.manage");
  const me = await requireUser();
  const { id } = await params;
  const { msg } = await searchParams;
  const supabase = await createClient();
  const [{ data: perms }, { data: rp }, { data: cats }] = await Promise.all([
    supabase.from("permissions").select("key, label, description, category_scoped").order("sort_order"),
    supabase.from("role_permissions").select("role, permission"),
    supabase.from("categories").select("*").order("sort_order"),
  ]);
  const rolePerms: Record<string, string[]> = {};
  for (const r of rp ?? []) (rolePerms[r.role] ??= []).push(r.permission);

  let user: Profile | null = null;
  let overrides: { permission: string; allow: boolean; category_id: string | null }[] = [];
  if (id !== "novo") {
    const [{ data: u }, { data: ov }] = await Promise.all([supabase.from("profiles").select("*").eq("id", id).maybeSingle(), supabase.from("user_permissions").select("permission, allow, category_id").eq("user_id", id)]);
    if (!u) notFound();
    user = u as Profile;
    overrides = ov ?? [];
  }
  return (
    <div>
      <PageHeader
        title={user ? user.full_name : "Novo usuário"}
        actions={user && user.id !== me.id ? (
          <>
            <form action={sendReset}><input type="hidden" name="email" value={user.email ?? ""} /><Button variant="secondary">Enviar redefinição de senha</Button></form>
            <form action={revokeSessions}><input type="hidden" name="id" value={user.id} /><ConfirmButton variant="secondary" message="Encerrar todas as sessões deste usuário?">Revogar sessões</ConfirmButton></form>
            {me.role === "master" && <form action={deleteUser}><input type="hidden" name="id" value={user.id} /><ConfirmButton message="Excluir este usuário? As matérias dele serão mantidas sem autor.">Excluir</ConfirmButton></form>}
          </>
        ) : null}
      />
      <UserForm user={user} perms={perms ?? []} rolePerms={rolePerms} overrides={overrides} categories={cats ?? []} meRole={me.role} initialMsg={msg} />
    </div>
  );
}
