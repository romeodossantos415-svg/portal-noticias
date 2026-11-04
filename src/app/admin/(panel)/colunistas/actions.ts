"use server";
import type { ActionState } from "@/lib/types";
import { redirect } from "next/navigation";
import { upsertRow, deleteRow, reorderRows } from "@/lib/crud";
import { slugify } from "@/lib/utils";

export async function saveColumnist(_: ActionState, form: FormData): Promise<ActionState> {
  const social = { instagram: form.get("s_instagram"), x: form.get("s_x"), facebook: form.get("s_facebook"), youtube: form.get("s_youtube"), linkedin: form.get("s_linkedin"), tiktok: form.get("s_tiktok") };
  const name = String(form.get("name") || "");
  const r = await upsertRow("columnists", "columnists.manage", form, { name: "text", photo_url: "text", bio: "text", specialty: "text", profile_id: "text", is_active: "bool" }, "colunista", {
    slug: slugify(String(form.get("slug") || name)),
    social_links: Object.fromEntries(Object.entries(social).filter(([, v]) => v).map(([k, v]) => [k, String(v)])),
  });
  if ("error" in r) return { error: r.error };
  redirect("/admin/colunistas?msg=Colunista salvo.");
}
export async function deleteColumnist(form: FormData) {
  await deleteRow("columnists", "columnists.manage", String(form.get("id")), "colunista");
  redirect("/admin/colunistas?msg=Colunista excluído.");
}
export async function reorderColumnists(ids: string[]) {
  return reorderRows("columnists", "columnists.manage", ids);
}
