import "server-only";
import { createClient } from "@/lib/supabase/server";
import { logActivity, requirePermission } from "@/lib/auth";
import { revalidateSite } from "@/lib/revalidate";

type FieldSpec = Record<string, "text" | "bool" | "number" | "date" | "json">;

/** Converte FormData em objeto conforme spec. */
export function parseForm(form: FormData, spec: FieldSpec) {
  const out: Record<string, unknown> = {};
  for (const [k, t] of Object.entries(spec)) {
    const v = form.get(k);
    if (t === "bool") out[k] = v === "on" || v === "true";
    else if (t === "number") out[k] = v === null || v === "" ? null : Number(v);
    else if (t === "date") out[k] = v ? new Date(String(v)).toISOString() : null;
    else if (t === "json") {
      try {
        out[k] = v ? JSON.parse(String(v)) : {};
      } catch {
        out[k] = {};
      }
    } else out[k] = v === null || String(v).trim() === "" ? null : String(v).trim();
  }
  return out;
}

export async function upsertRow(table: string, perm: string, form: FormData, spec: FieldSpec, label: string, extra: Record<string, unknown> = {}) {
  await requirePermission(perm);
  const supabase = await createClient();
  const id = String(form.get("id") || "");
  const payload = { ...parseForm(form, spec), ...extra };
  if (id) {
    const { error } = await supabase.from(table).update(payload).eq("id", id);
    if (error) return { error: error.message };
    await logActivity("editou", label, id);
    revalidateSite();
    return { ok: true, id };
  }
  const { data, error } = await supabase.from(table).insert(payload).select("id").single();
  if (error) return { error: error.message };
  await logActivity("criou", label, data.id);
  revalidateSite();
  return { ok: true, id: data.id as string };
}

export async function deleteRow(table: string, perm: string, id: string, label: string) {
  await requirePermission(perm);
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity("excluiu", label, id);
  revalidateSite();
  return { ok: true };
}

export async function reorderRows(table: string, perm: string, ids: string[]) {
  await requirePermission(perm);
  const supabase = await createClient();
  await Promise.all(ids.map((id, i) => supabase.from(table).update({ sort_order: i }).eq("id", id)));
  revalidateSite();
  return { ok: true };
}
