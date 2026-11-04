"use server";
import type { ActionState } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { logActivity, requirePermission } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";

const APPEARANCE_KEYS = ["identity", "theme", "header", "ticker", "footer", "social", "home_layout", "links_page"];
const SETTINGS_KEYS = ["seo"];

export async function saveSettings(key: string, value: unknown) {
  if (APPEARANCE_KEYS.includes(key)) await requirePermission("appearance.manage");
  else if (SETTINGS_KEYS.includes(key)) await requirePermission("settings.manage");
  else if (key === "links_page") await requirePermission("links.manage");
  else throw new Error("Configuração desconhecida.");
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({ key, value: value as never });
  if (error) return { error: error.message };
  await logActivity("alterou configuração", key, key);
  revalidateSite();
  return { ok: true };
}

/** Salva vários grupos de uma vez a partir de um FormData com prefixos "grupo.campo". */
export async function saveSettingsForm(_: ActionState, form: FormData): Promise<ActionState> {
  const groups: Record<string, Record<string, unknown>> = {};
  for (const [k, v] of form.entries()) {
    const [g, f] = k.split(".");
    if (!g || !f) continue;
    (groups[g] ??= {})[f] = v;
  }
  const supabase = await createClient();
  for (const g of Object.keys(groups)) {
    const { data: current } = await supabase.from("site_settings").select("value").eq("key", g).maybeSingle();
    const merged = { ...((current?.value as Record<string, unknown>) ?? {}) };
    for (const [f, v] of Object.entries(groups[g])) {
      const cur = merged[f];
      if (typeof cur === "boolean" || v === "on" || f.startsWith("show_") || f === "enabled" || f === "sticky") merged[f] = v === "on" || v === "true";
      else if (typeof cur === "number") merged[f] = Number(v);
      else merged[f] = v === "" ? (cur === null ? null : "") : v;
    }
    // checkboxes desmarcadas não vêm no FormData
    for (const [f, cur] of Object.entries(merged)) if (typeof cur === "boolean" && !(f in groups[g]) && form.has(`${g}.__has_${f}`)) merged[f] = false;
    const r = await saveSettings(g, merged);
    if ("error" in r) return { error: r.error };
  }
  return { success: "Configurações salvas. O site já reflete as alterações." };
}
