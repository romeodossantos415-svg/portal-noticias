"use client";
import type { ActionState } from "@/lib/types";
import { useActionState } from "react";
import { saveSettingsForm } from "@/app/admin/(panel)/personalizar/actions";
import { Alert, SubmitButton } from "./ui";

export function SettingsForm({ children }: { children: React.ReactNode }) {
  const [state, action] = useActionState<ActionState, FormData>(saveSettingsForm, {});
  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.success && <Alert kind="success">{state.success}</Alert>}
      {children}
      <div className="flex justify-end"><SubmitButton>Salvar</SubmitButton></div>
    </form>
  );
}
