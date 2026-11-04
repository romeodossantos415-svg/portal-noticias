"use client";
import { useActionState, useState } from "react";
import { createUser, updateUser, type UserState } from "@/app/admin/(panel)/usuarios/actions";
import { ImageField } from "./MediaPicker";
import { Field, Input, Textarea, Select, SubmitButton, Alert, Card } from "./ui";
import { ROLE_LABELS, type Category, type Profile, type UserRole } from "@/lib/types";

type Perm = { key: string; label: string; description: string | null; category_scoped: boolean };
type Override = { permission: string; allow: boolean; category_id: string | null };

export function UserForm({ user, perms, rolePerms, overrides, categories, meRole, initialMsg }: { user: Profile | null; perms: Perm[]; rolePerms: Record<string, string[]>; overrides: Override[]; categories: Category[]; meRole: UserRole; initialMsg?: string }) {
  const isNew = !user;
  const [state, action] = useActionState<UserState, FormData>(isNew ? createUser : updateUser, { success: initialMsg });
  const [role, setRole] = useState<UserRole>(user?.role ?? "author");
  const [mode, setMode] = useState<"password" | "invite">("invite");
  const roles = (Object.keys(ROLE_LABELS) as UserRole[]).filter((r) => meRole === "master" || (r !== "master" && r !== "admin"));

  const modeOf = (key: string) => {
    const rows = overrides.filter((o) => o.permission === key);
    if (!rows.length) return "inherit";
    if (rows.some((r) => r.category_id)) return "category";
    return rows[0].allow ? "allow" : "deny";
  };

  return (
    <form action={action} className="grid lg:grid-cols-3 gap-6">
      {user && <input type="hidden" name="id" value={user.id} />}
      <div className="space-y-4">
        {state.error && <Alert kind="error">{state.error}</Alert>}
        {state.success && <Alert kind="success">{state.success}</Alert>}
        <Card title="Dados">
          <div className="space-y-3">
            <Field label="Nome completo"><Input name="full_name" defaultValue={user?.full_name} required /></Field>
            <Field label="E-mail"><Input name="email" type="email" defaultValue={user?.email ?? ""} required disabled={!isNew} /></Field>
            <Field label="Nome de usuário"><Input name="username" defaultValue={user?.username ?? ""} /></Field>
            <Field label="Perfil (função)">
              <Select name="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                {roles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </Select>
            </Field>
            {!isNew && (
              <Field label="Status da conta">
                <Select name="status" defaultValue={user?.status}>
                  <option value="active">Ativo</option><option value="blocked">Bloqueado</option><option value="pending">Pendente</option>
                </Select>
              </Field>
            )}
            <ImageField name="avatar_url" label="Fotografia" defaultValue={user?.avatar_url} />
            {!isNew && <Field label="Biografia"><Textarea name="bio" defaultValue={user?.bio ?? ""} className="!min-h-16" /></Field>}
            {isNew && (
              <div className="space-y-2 border-t pt-3">
                <label className="flex items-center gap-2 text-sm"><input type="radio" name="mode" value="invite" checked={mode === "invite"} onChange={() => setMode("invite")} /> Convidar por e-mail (link seguro para criar senha)</label>
                <label className="flex items-center gap-2 text-sm"><input type="radio" name="mode" value="password" checked={mode === "password"} onChange={() => setMode("password")} /> Definir senha temporária</label>
                {mode === "password" && <Field label="Senha temporária"><Input name="password" type="text" minLength={8} /></Field>}
              </div>
            )}
            <SubmitButton className="w-full">{isNew ? (mode === "invite" ? "Enviar convite" : "Criar usuário") : "Salvar"}</SubmitButton>
          </div>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card title="Permissões">
          <p className="text-xs text-slate-500 mb-3">
            As colunas mostram o que o perfil <strong>{ROLE_LABELS[role]}</strong> já permite. Use “Permitir” / “Negar” para personalizar, ou “Somente categorias” para restringir a editorias específicas.
            {role === "master" && " O administrador master tem acesso total; overrides são ignorados."}
          </p>
          {isNew ? (
            <p className="text-sm text-slate-500">Salve o usuário primeiro para configurar permissões individuais.</p>
          ) : (
            <div className="divide-y">
              {perms.map((p) => {
                const byRole = (rolePerms[role] ?? []).includes(p.key);
                const m = modeOf(p.key);
                return (
                  <div key={p.key} className="py-2.5 grid md:grid-cols-5 gap-2 items-center text-sm">
                    <div className="md:col-span-2">
                      <div className="font-medium">{p.label}</div>
                      <div className="text-xs text-slate-400">{p.description}</div>
                    </div>
                    <div className="text-xs"><span className={`px-2 py-0.5 rounded ${byRole ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{byRole ? "Perfil permite" : "Perfil não permite"}</span></div>
                    <PermSelect name={`perm.${p.key}`} defaultValue={m} scoped={p.category_scoped} />
                    {p.category_scoped && (
                      <details className="text-xs" open={m === "category"}>
                        <summary className="cursor-pointer text-slate-500">categorias</summary>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          {categories.map((c) => (
                            <label key={c.id} className="flex items-center gap-1">
                              <input type="checkbox" name={`permcat.${p.key}`} value={c.id} defaultChecked={overrides.some((o) => o.permission === p.key && o.category_id === c.id && o.allow)} /> {c.name}
                            </label>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </form>
  );
}

function PermSelect({ name, defaultValue, scoped }: { name: string; defaultValue: string; scoped: boolean }) {
  return (
    <select name={name} defaultValue={defaultValue} className="border rounded-lg px-2 py-1.5 text-sm">
      <option value="inherit">Herdar do perfil</option>
      <option value="allow">Permitir</option>
      <option value="deny">Negar</option>
      {scoped && <option value="category">Somente categorias…</option>}
    </select>
  );
}
