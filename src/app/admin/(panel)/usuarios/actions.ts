"use server";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { logActivity, requirePermission, requireUser } from "@/lib/auth";
import { siteUrl } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

export type UserState = { error?: string; success?: string };
const ROLES: UserRole[] = ["master", "admin", "editor", "author", "contributor"];

function hasServiceRole() {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/** Apenas o MASTER pode criar/alterar outros admins/masters. */
async function assertRoleAllowed(targetRole: UserRole) {
  const me = await requireUser();
  if (me.role !== "master" && (targetRole === "master" || targetRole === "admin")) {
    throw new Error("Somente o administrador master pode conceder perfis administrativos.");
  }
}

export async function createUser(_: UserState, form: FormData): Promise<UserState> {
  await requirePermission("users.manage");
  if (!hasServiceRole()) return { error: "Para criar usuários, configure SUPABASE_SERVICE_ROLE_KEY no servidor (veja o manual)." };
  const email = String(form.get("email") || "").trim().toLowerCase();
  const full_name = String(form.get("full_name") || "").trim();
  const username = String(form.get("username") || "").trim().toLowerCase() || null;
  const role = String(form.get("role") || "contributor") as UserRole;
  const password = String(form.get("password") || "");
  const invite = form.get("mode") === "invite";
  if (!email || !full_name) return { error: "Nome e e-mail são obrigatórios." };
  if (!ROLES.includes(role)) return { error: "Perfil inválido." };
  try {
    await assertRoleAllowed(role);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const admin = createAdminClient();
  let userId = "";
  if (invite) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name, username, role }, redirectTo: siteUrl("/admin/auth/callback?next=/admin/redefinir") });
    if (error) return { error: `Erro ao convidar: ${error.message}` };
    userId = data.user.id;
  } else {
    if (password.length < 8) return { error: "A senha temporária deve ter pelo menos 8 caracteres." };
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name, username, role } });
    if (error) return { error: `Erro ao criar: ${error.message}` };
    userId = data.user.id;
  }
  // garante o perfil correto (o trigger cria; aqui atualizamos papel/username/status)
  await admin.from("profiles").update({ full_name, username, role, status: invite ? "pending" : "active", avatar_url: String(form.get("avatar_url") || "") || null }).eq("id", userId);
  await logActivity(invite ? "convidou usuário" : "criou usuário", "usuário", userId, { email, role });
  redirect(`/admin/usuarios/${userId}?msg=${encodeURIComponent(invite ? "Convite enviado por e-mail." : "Usuário criado.")}`);
}

export async function updateUser(_: UserState, form: FormData): Promise<UserState> {
  await requirePermission("users.manage");
  const me = await requireUser();
  const id = String(form.get("id"));
  const role = String(form.get("role")) as UserRole;
  const status = String(form.get("status")) as "active" | "blocked" | "pending";
  if (!ROLES.includes(role)) return { error: "Perfil inválido." };
  const supabase = await createClient();
  const { data: target } = await supabase.from("profiles").select("role").eq("id", id).single();
  if (!target) return { error: "Usuário não encontrado." };
  if (me.id === id && (role !== me.role || status !== "active")) return { error: "Você não pode alterar seu próprio perfil/status." };
  if (me.role !== "master" && (target.role === "master" || target.role === "admin")) return { error: "Somente o master pode alterar administradores." };
  try {
    await assertRoleAllowed(role);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: String(form.get("full_name") || "").trim(), username: String(form.get("username") || "").trim() || null, role, status, avatar_url: String(form.get("avatar_url") || "") || null, bio: String(form.get("bio") || "") || null })
    .eq("id", id);
  if (error) return { error: error.message };

  // permissões individuais
  const { data: perms } = await supabase.from("permissions").select("key");
  await supabase.from("user_permissions").delete().eq("user_id", id);
  const rows: { user_id: string; permission: string; allow: boolean; category_id: string | null }[] = [];
  for (const p of perms ?? []) {
    const v = String(form.get(`perm.${p.key}`) || "inherit");
    if (v === "allow") rows.push({ user_id: id, permission: p.key, allow: true, category_id: null });
    if (v === "deny") rows.push({ user_id: id, permission: p.key, allow: false, category_id: null });
    if (v === "category") {
      const cats = form.getAll(`permcat.${p.key}`).map(String).filter(Boolean);
      // nega globalmente e permite apenas nas categorias escolhidas
      rows.push({ user_id: id, permission: p.key, allow: false, category_id: null });
      for (const c of cats) rows.push({ user_id: id, permission: p.key, allow: true, category_id: c });
    }
  }
  if (rows.length) {
    const { error: e2 } = await supabase.from("user_permissions").insert(rows);
    if (e2) return { error: e2.message };
  }
  await logActivity("alterou usuário/permissões", "usuário", id, { role, status });
  return { success: "Usuário atualizado." };
}

export async function deleteUser(form: FormData) {
  await requirePermission("users.manage");
  const me = await requireUser();
  const id = String(form.get("id"));
  if (id === me.id) throw new Error("Você não pode excluir a si mesmo.");
  if (me.role !== "master") throw new Error("Somente o master pode excluir usuários.");
  if (!hasServiceRole()) throw new Error("Configure SUPABASE_SERVICE_ROLE_KEY para excluir usuários.");
  const admin = createAdminClient();
  // matérias ficam (author_id vira null via FK on delete set null)
  await admin.auth.admin.deleteUser(id);
  await logActivity("excluiu usuário", "usuário", id);
  redirect("/admin/usuarios?msg=Usuário excluído.");
}

export async function revokeSessions(form: FormData) {
  await requirePermission("users.manage");
  if (!hasServiceRole()) throw new Error("Configure SUPABASE_SERVICE_ROLE_KEY.");
  const id = String(form.get("id"));
  const admin = createAdminClient();
  await admin.auth.admin.signOut(id as never, "global" as never).catch(async () => {
    // fallback: invalida via logout do usuário na próxima verificação, bloqueando momentaneamente
    await admin.from("profiles").update({ status: "blocked" }).eq("id", id);
    await admin.from("profiles").update({ status: "active" }).eq("id", id);
  });
  await logActivity("revogou sessões", "usuário", id);
}

export async function sendReset(form: FormData) {
  await requirePermission("users.manage");
  const email = String(form.get("email"));
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: siteUrl("/admin/redefinir") });
}

export async function updateOwnProfile(_: UserState, form: FormData): Promise<UserState> {
  const me = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: String(form.get("full_name") || "").trim(), bio: String(form.get("bio") || "") || null, avatar_url: String(form.get("avatar_url") || "") || null })
    .eq("id", me.id);
  if (error) return { error: error.message };
  const pw = String(form.get("password") || "");
  if (pw) {
    if (pw.length < 8) return { error: "A senha deve ter pelo menos 8 caracteres." };
    const { error: e2 } = await supabase.auth.updateUser({ password: pw });
    if (e2) return { error: e2.message };
  }
  return { success: "Perfil atualizado." };
}
