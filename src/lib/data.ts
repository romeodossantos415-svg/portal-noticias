import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import type {
  Ad,
  AdPosition,
  Article,
  Category,
  Columnist,
  Episode,
  FeaturedItem,
  FeaturedSlot,
  LinkButton,
  MenuItem,
  Page,
  Show,
  SiteSettings,
} from "@/lib/types";

const ARTICLE_SELECT =
  "*, category:categories(*), author:profiles!articles_author_id_fkey(id, full_name, avatar_url, username), columnist:columnists(*)";

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const s: Record<string, unknown> = {};
  (data ?? []).forEach((r) => (s[r.key] = r.value));
  return s as unknown as SiteSettings;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []) as Category[];
});

export const getMenu = cache(async (key: "header" | "footer"): Promise<MenuItem[]> => {
  const supabase = createPublicClient();
  const [{ data: items }, { data: cats }, { data: pages }] = await Promise.all([
    supabase.from("menu_items").select("*").eq("menu_key", key).eq("is_visible", true).order("sort_order"),
    supabase.from("categories").select("id, slug"),
    supabase.from("pages").select("id, slug"),
  ]);
  const catSlug = new Map((cats ?? []).map((c) => [c.id, c.slug]));
  const pageSlug = new Map((pages ?? []).map((p) => [p.id, p.slug]));
  const withHref = ((items ?? []) as MenuItem[]).map((m) => ({
    ...m,
    href:
      m.type === "home"
        ? "/"
        : m.type === "category"
          ? `/categoria/${catSlug.get(m.category_id ?? "") ?? ""}`
          : m.type === "page"
            ? `/pagina/${pageSlug.get(m.page_id ?? "") ?? ""}`
            : (m.url ?? "#"),
  }));
  const roots = withHref.filter((m) => !m.parent_id);
  return roots.map((r) => ({ ...r, children: withHref.filter((c) => c.parent_id === r.id) }));
});

export const getFeatured = cache(async (): Promise<Record<string, Article[]>> => {
  const supabase = createPublicClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("featured_items")
    .select(`slot_key, sort_order, custom_title, starts_at, ends_at, article:articles!inner(${ARTICLE_SELECT})`)
    .eq("article.status", "published")
    .order("sort_order");
  const out: Record<string, Article[]> = {};
  for (const row of (data ?? []) as unknown as (FeaturedItem & { starts_at: string | null; ends_at: string | null })[]) {
    if (row.starts_at && row.starts_at > now) continue;
    if (row.ends_at && row.ends_at < now) continue;
    if (!row.article) continue;
    const a = { ...row.article, title: row.custom_title || row.article.title };
    (out[row.slot_key] ??= []).push(a);
  }
  return out;
});

export const getFeaturedSlots = cache(async (): Promise<FeaturedSlot[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("featured_slots").select("*").order("sort_order");
  return (data ?? []) as FeaturedSlot[];
});

export async function getLatestArticles(limit = 12, offset = 0, excludeIds: string[] = []): Promise<Article[]> {
  const supabase = createPublicClient();
  let q = supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (excludeIds.length) q = q.not("id", "in", `(${excludeIds.join(",")})`);
  const { data } = await q;
  return (data ?? []) as unknown as Article[];
}

export async function getArticlesByCategory(categoryId: string, limit = 6, offset = 0) {
  const supabase = createPublicClient();
  const { data, count } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT, { count: "exact" })
    .eq("status", "published")
    .eq("category_id", categoryId)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return { articles: (data ?? []) as unknown as Article[], total: count ?? 0 };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("articles").select(ARTICLE_SELECT).eq("slug", slug).eq("status", "published").maybeSingle();
  return (data as unknown as Article) ?? null;
}

export async function getArticleTags(articleId: string) {
  const supabase = createPublicClient();
  const { data } = await supabase.from("article_tags").select("tag:tags(id, name, slug)").eq("article_id", articleId);
  return (data ?? []).map((r) => r.tag).filter(Boolean) as unknown as { id: string; name: string; slug: string }[];
}

export async function getRelatedArticles(article: Article, limit = 4) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .eq("category_id", article.category_id ?? "")
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Article[];
}

export async function getMostRead(limit = 5) {
  const supabase = createPublicClient();
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString();
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .gte("published_at", since)
    .order("view_count", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Article[];
}

export const getColumnists = cache(async (): Promise<Columnist[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("columnists").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []) as Columnist[];
});

export async function getColumnistBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase.from("columnists").select("*").eq("slug", slug).maybeSingle();
  return (data as Columnist) ?? null;
}

export async function getColumnistArticles(columnistId: string, limit = 10, offset = 0) {
  const supabase = createPublicClient();
  const { data, count } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT, { count: "exact" })
    .eq("status", "published")
    .eq("columnist_id", columnistId)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return { articles: (data ?? []) as unknown as Article[], total: count ?? 0 };
}

export async function getLatestColumnistArticles(limit = 4) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .not("columnist_id", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Article[];
}

export async function getEpisodes(limit = 6, showId?: string) {
  const supabase = createPublicClient();
  let q = supabase
    .from("episodes")
    .select("*, show:shows(*)")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (showId) q = q.eq("show_id", showId);
  const { data } = await q;
  return (data ?? []) as unknown as Episode[];
}

export async function getEpisodeBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase.from("episodes").select("*, show:shows(*)").eq("slug", slug).eq("is_published", true).maybeSingle();
  return (data as unknown as Episode) ?? null;
}

export const getShows = cache(async (): Promise<Show[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("shows").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []) as Show[];
});

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("pages").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  return (data as Page) ?? null;
}

export const getFooterPages = cache(async () => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("pages").select("id, title, slug").eq("is_published", true).eq("show_in_footer", true).order("sort_order");
  return data ?? [];
});

export const getAds = cache(async (): Promise<Record<AdPosition, Ad[]>> => {
  const supabase = createPublicClient();
  const now = new Date().toISOString();
  const { data } = await supabase.from("ads").select("*").eq("is_active", true).order("sort_order");
  const out = {} as Record<AdPosition, Ad[]>;
  for (const ad of (data ?? []) as Ad[]) {
    if (ad.starts_at && ad.starts_at > now) continue;
    if (ad.ends_at && ad.ends_at < now) continue;
    (out[ad.position] ??= []).push(ad);
  }
  return out;
});

export async function getLinkButtons(): Promise<LinkButton[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("link_buttons").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []) as LinkButton[];
}

export async function searchArticles(q: string, limit = 20, offset = 0): Promise<Article[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.rpc("search_articles", { q, lim: limit, off: offset });
  if (!data?.length) return [];
  const ids = data.map((a: { id: string }) => a.id);
  const { data: full } = await supabase.from("articles").select(ARTICLE_SELECT).in("id", ids);
  const map = new Map((full ?? []).map((a) => [a.id, a]));
  return ids.map((id: string) => map.get(id)).filter(Boolean) as unknown as Article[];
}

export async function getArticlesByTag(slug: string, limit = 20) {
  const supabase = createPublicClient();
  const { data: tag } = await supabase.from("tags").select("*").eq("slug", slug).maybeSingle();
  if (!tag) return { tag: null, articles: [] as Article[] };
  const { data } = await supabase
    .from("article_tags")
    .select(`article:articles!inner(${ARTICLE_SELECT})`)
    .eq("tag_id", tag.id)
    .eq("article.status", "published")
    .limit(limit);
  return { tag, articles: (data ?? []).map((r) => r.article).filter(Boolean) as unknown as Article[] };
}

export async function getCategoryBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  return (data as Category) ?? null;
}
