import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getPermissions } from "@/lib/auth";

export async function loadFormDeps() {
  const supabase = await createClient();
  const [user, perms, { data: categories }, { data: authors }, { data: columnists }] = await Promise.all([
    getCurrentUser(),
    getPermissions(),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("profiles").select("id, full_name").eq("status", "active").order("full_name"),
    supabase.from("columnists").select("*").eq("is_active", true).order("name"),
  ]);
  return {
    me: { id: user!.id, full_name: user!.full_name },
    perms: { publish: perms.has("articles.publish"), editAny: perms.has("articles.edit_any"), seo: perms.has("seo.edit") },
    categories: categories ?? [],
    authors: authors ?? [],
    columnists: columnists ?? [],
  };
}
