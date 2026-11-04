"use server";
import type { ActionState } from "@/lib/types";
import { redirect } from "next/navigation";
import { upsertRow, deleteRow } from "@/lib/crud";
import { slugify } from "@/lib/utils";
import { requireUser } from "@/lib/auth";

export async function saveShow(_: ActionState, form: FormData): Promise<ActionState> {
  const name = String(form.get("name") || "");
  const r = await upsertRow("shows", "audiovisual.manage", form, { name: "text", type: "text", description: "text", cover_url: "text", is_active: "bool" }, "programa", { slug: slugify(String(form.get("slug") || name)) });
  if ("error" in r) return { error: r.error };
  redirect("/admin/audiovisual?msg=Programa salvo.&tab=programas");
}
export async function deleteShow(form: FormData) {
  await deleteRow("shows", "audiovisual.manage", String(form.get("id")), "programa");
  redirect("/admin/audiovisual?tab=programas");
}
export async function saveEpisode(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const title = String(form.get("title") || "");
  const r = await upsertRow(
    "episodes", "audiovisual.manage", form,
    { title: "text", show_id: "text", description: "text", type: "text", embed_url: "text", audio_url: "text", cover_url: "text", guest_name: "text", duration_seconds: "number", published_at: "date", is_published: "bool" },
    "episódio",
    { slug: slugify(String(form.get("slug") || title)), ...(String(form.get("id")) ? {} : { created_by: user.id }) },
  );
  if ("error" in r) return { error: r.error };
  redirect("/admin/audiovisual?msg=Episódio salvo.");
}
export async function deleteEpisode(form: FormData) {
  await deleteRow("episodes", "audiovisual.manage", String(form.get("id")), "episódio");
  redirect("/admin/audiovisual");
}
