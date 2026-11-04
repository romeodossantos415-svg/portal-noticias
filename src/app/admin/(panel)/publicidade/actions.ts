"use server";
import type { ActionState } from "@/lib/types";
import { redirect } from "next/navigation";
import { upsertRow, deleteRow } from "@/lib/crud";

export async function saveAd(_: ActionState, form: FormData): Promise<ActionState> {
  const r = await upsertRow("ads", "ads.manage", form, { name: "text", position: "text", image_url: "text", link_url: "text", html_code: "text", starts_at: "date", ends_at: "date", is_active: "bool", sort_order: "number" }, "anúncio");
  if ("error" in r) return { error: r.error };
  redirect("/admin/publicidade?msg=Anúncio salvo.");
}
export async function deleteAd(form: FormData) {
  await deleteRow("ads", "ads.manage", String(form.get("id")), "anúncio");
  redirect("/admin/publicidade");
}
