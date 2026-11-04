import { getCategories, getColumnists, getFeatured, getSettings, getLatestArticles } from "@/lib/data";
import { RenderHomeBlocks } from "@/components/site/HomeBlocks";
import { siteUrl } from "@/lib/utils";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, featured, categories, columnists] = await Promise.all([getSettings(), getFeatured(), getCategories(), getColumnists()]);

  // Fallback: se o administrador ainda não escolheu manchetes, usa as mais recentes.
  if (!featured.hero_main?.length && !featured.hero_secondary?.length) {
    const latest = await getLatestArticles(5);
    featured.hero_main = latest.slice(0, 1);
    featured.hero_secondary = latest.slice(1, 5);
  }
  if (!featured.ticker?.length) featured.ticker = await getLatestArticles(8);

  const blocks = settings.home_layout?.blocks ?? [{ type: "ticker" }, { type: "hero" }, { type: "categories" }, { type: "latest" }];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: settings.identity?.name,
    url: siteUrl(),
    logo: settings.identity?.logo_url ?? undefined,
    sameAs: Object.values(settings.social ?? {}).filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RenderHomeBlocks blocks={blocks} featured={featured} settings={settings} categories={categories} columnists={columnists} />
    </>
  );
}
