"use server";
import type { ActionState } from "@/lib/types";
import { redirect } from "next/navigation";
import { upsertRow, deleteRow, reorderRows } from "@/lib/crud";

export async function saveLink(_: ActionState, form: FormData): Promise<ActionState> {
  const r = await upsertRow("link_buttons", "links.manage", form, { label: "text", url: "text", icon: "text", style: "text", is_active: "bool" }, "botão de link");
  if ("error" in r) return { error: r.error };
  redirect("/admin/links?msg=Botão salvo.");
}
export async function deleteLink(form: FormData) {
  await deleteRow("link_buttons", "links.manage", String(form.get("id")), "botão de link");
  redirect("/admin/links");
}
export async function reorderLinks(ids: string[]) {
  return reorderRows("link_buttons", "links.manage", ids);
}
