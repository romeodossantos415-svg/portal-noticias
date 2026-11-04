import { getLatestArticles, getSettings } from "@/lib/data";
import { siteUrl, stripHtml } from "@/lib/utils";

export const revalidate = 300;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const [s, articles] = await Promise.all([getSettings(), getLatestArticles(30)]);
  const items = articles
    .map(
      (a) => `
    <item>
      <title>${esc(a.title)}</title>
      <link>${siteUrl(`/noticia/${a.slug}`)}</link>
      <guid isPermaLink="true">${siteUrl(`/noticia/${a.slug}`)}</guid>
      <pubDate>${new Date(a.published_at ?? a.created_at).toUTCString()}</pubDate>
      ${a.category ? `<category>${esc(a.category.name)}</category>` : ""}
      ${a.author?.full_name ? `<dc:creator>${esc(a.author.full_name)}</dc:creator>` : ""}
      <description>${esc(a.subtitle ?? a.excerpt ?? stripHtml(a.content).slice(0, 300))}</description>
      ${a.cover_url ? `<enclosure url="${esc(a.cover_url)}" type="image/jpeg" />` : ""}
    </item>`,
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(s.identity?.name ?? "Portal")}</title>
    <link>${siteUrl()}</link>
    <description>${esc(s.identity?.description ?? "")}</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
