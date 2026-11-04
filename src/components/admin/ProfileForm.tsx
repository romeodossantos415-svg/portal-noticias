"use client";
import { useActionState } from "react";
import { updateOwnProfile, type UserState } from "@/app/admin/(panel)/usuarios/actions";
import { ImageField } from "./MediaPicker";
import { Field, Input, Textarea, SubmitButton, Alert, Card } from "./ui";
import type { Profile } from "@/lib/types";

export function ProfileForm({ user }: { user: Profile }) {
  const [state, action] = useActionState<UserState, FormData>(updateOwnProfile, {});
  return (
    <form action={action} className="max-w-lg">
      <Card>
        <div className="space-y-3">
          {state.error && <Alert kind="error">{state.error}</Alert>}
          {state.success && <Alert kind="success">{state.success}</Alert>}
          <Field label="Nome completo"><Input name="full_name" defaultValue={user.full_name} required /></Field>
          <Field label="E-mail"><Input defaultValue={user.email ?? ""} disabled /></Field>
          <ImageField name="avatar_url" label="Fotografia" defaultValue={user.avatar_url} />
          <Field label="Biografia (exibida nas matérias)"><Textarea name="bio" defaultValue={user.bio ?? ""} /></Field>
          <Field label="Nova senha" hint="Deixe em branco para manter."><Input name="password" type="password" minLength={8} autoComplete="new-password" /></Field>
          <SubmitButton>Salvar</SubmitButton>
        </div>
      </Card>
    </form>
  );
}
