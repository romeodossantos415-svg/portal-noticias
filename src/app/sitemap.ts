import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/utils";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const [{ data: articles }, { data: cats }, { data: pages }, { data: cols }, { data: eps }] = await Promise.all([
    supabase.from("articles").select("slug, updated_at, published_at").eq("status", "published").order("published_at", { ascending: false }).limit(5000),
    supabase.from("categories").select("slug").eq("is_active", true),
    supabase.from("pages").select("slug, updated_at").eq("is_published", true),
    supabase.from("columnists").select("slug").eq("is_active", true),
    supabase.from("episodes").select("slug, published_at").eq("is_published", true),
  ]);
  return [
    { url: siteUrl("/"), changeFrequency: "hourly", priority: 1 },
    { url: siteUrl("/ultimas"), changeFrequency: "hourly", priority: 0.8 },
    { url: siteUrl("/videos"), changeFrequency: "daily", priority: 0.6 },
    { url: siteUrl("/colunistas"), changeFrequency: "weekly", priority: 0.5 },
    ...(articles ?? []).map((a) => ({ url: siteUrl(`/noticia/${a.slug}`), lastModified: a.updated_at, changeFrequency: "daily" as const, priority: 0.9 })),
    ...(cats ?? []).map((c) => ({ url: siteUrl(`/categoria/${c.slug}`), changeFrequency: "hourly" as const, priority: 0.7 })),
    ...(pages ?? []).map((p) => ({ url: siteUrl(`/pagina/${p.slug}`), lastModified: p.updated_at, changeFrequency: "monthly" as const, priority: 0.3 })),
    ...(cols ?? []).map((c) => ({ url: siteUrl(`/colunistas/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.5 })),
    ...(eps ?? []).map((e) => ({ url: siteUrl(`/videos/${e.slug}`), lastModified: e.published_at ?? undefined, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
