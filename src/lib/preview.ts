import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

/** Matéria não publicada, visível apenas para usuários do painel (RLS garante). */
export async function getPreviewArticle(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*, category:categories(*), author:profiles!articles_author_id_fkey(id, full_name, avatar_url, username), columnist:columnists(*)")
    .eq("slug", slug)
    .maybeSingle();
  return (data as unknown as Article) ?? null;
}
