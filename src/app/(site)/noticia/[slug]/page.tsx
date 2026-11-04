import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticleTags, getArticlesByCategory, getMostRead, getRelatedArticles, getSettings } from "@/lib/data";
import { getPreviewArticle } from "@/lib/preview";
import { formatDate, siteUrl, stripHtml } from "@/lib/utils";
import { ArticleCard, ArticleCompact, ArticleRow } from "@/components/site/ArticleCard";
import { ShareButtons } from "@/components/site/ShareButtons";
import { ViewCounter } from "@/components/site/ViewCounter";
import { AdSlot } from "@/components/site/AdSlot";
import { ChevronRight } from "lucide-react";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) return {};
  const title = a.seo_title || a.title;
  const description = a.seo_description || a.subtitle || a.excerpt || stripHtml(a.content).slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: a.canonical_url || siteUrl(`/noticia/${a.slug}`) },
    openGraph: {
      type: "article",
      title,
      description,
      url: siteUrl(`/noticia/${a.slug}`),
      images: a.cover_url ? [{ url: a.cover_url, alt: a.cover_alt ?? a.title }] : undefined,
      publishedTime: a.published_at ?? undefined,
      modifiedTime: a.updated_at,
      authors: a.author?.full_name ? [a.author.full_name] : undefined,
      section: a.category?.name,
    },
    twitter: { card: "summary_large_image", title, description, images: a.cover_url ? [a.cover_url] : undefined },
  };
}

export default async function ArticlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const article = (await getArticleBySlug(slug)) ?? (preview ? await getPreviewArticle(slug) : null);
  if (!article) notFound();
  const isPreview = article.status !== "published";

  const [settings, tags, related, mostRead, more] = await Promise.all([
    getSettings(),
    getArticleTags(article.id),
    getRelatedArticles(article, 4),
    getMostRead(5),
    article.category_id ? getArticlesByCategory(article.category_id, 6) : Promise.resolve({ articles: [], total: 0 }),
  ]);
  const moreFromCategory = more.articles.filter((a) => a.id !== article.id && !related.some((r) => r.id === a.id)).slice(0, 4);
  const url = siteUrl(`/noticia/${article.slug}`);
  const updated = article.published_at && article.updated_at > article.published_at ? article.updated_at : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.subtitle ?? article.excerpt ?? undefined,
    image: article.cover_url ? [article.cover_url] : undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: article.author ? [{ "@type": "Person", name: article.author.full_name }] : undefined,
    publisher: {
      "@type": "NewsMediaOrganization",
      name: settings.identity?.name,
      logo: settings.identity?.logo_url ? { "@type": "ImageObject", url: settings.identity.logo_url } : undefined,
    },
    mainEntityOfPage: url,
    articleSection: article.category?.name,
    keywords: tags.map((t) => t.name).join(", ") || undefined,
    isAccessibleForFree: true,
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl("/") },
      article.category && { "@type": "ListItem", position: 2, name: article.category.name, item: siteUrl(`/categoria/${article.category.slug}`) },
      { "@type": "ListItem", position: article.category ? 3 : 2, name: article.title, item: url },
    ].filter(Boolean),
  };

  return (
    <article className="container-site mt-6 md:mt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {isPreview ? (
        <div className="bg-amber-100 text-amber-900 text-sm px-4 py-2 rounded mb-4 font-medium">Pré-visualização — esta matéria ainda não está publicada.</div>
      ) : (
        <ViewCounter articleId={article.id} />
      )}

      {/* Breadcrumb */}
      <nav aria-label="Caminho" className="flex items-center gap-1 text-xs text-muted mb-5">
        <Link href="/" className="hover:text-primary">Início</Link>
        {article.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/categoria/${article.category.slug}`} className="hover:text-primary">{article.category.name}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <header className="max-w-3xl space-y-4">
            {article.is_sponsored && (
              <span className="inline-block bg-accent/20 text-amber-900 text-xs font-semibold px-2 py-1 rounded">Conteúdo patrocinado{article.sponsor_name ? ` · ${article.sponsor_name}` : ""}</span>
            )}
            {article.category && (
              <Link href={`/categoria/${article.category.slug}`} className="kicker" style={{ color: article.category.color ?? undefined }}>
                {article.category.name}
              </Link>
            )}
            <h1 className="headline text-3xl md:text-5xl" style={{ fontSize: `calc(clamp(1.9rem, 4.5vw, 3rem) * var(--heading-scale))` }}>{article.title}</h1>
            {article.subtitle && <p className="text-lg md:text-xl text-muted leading-relaxed font-light">{article.subtitle}</p>}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-black/10">
              <div className="flex items-center gap-3 py-3">
                {article.author?.avatar_url ? (
                  <Image src={article.author.avatar_url} alt={article.author.full_name} width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                ) : article.columnist?.photo_url ? (
                  <Image src={article.columnist.photo_url} alt={article.columnist.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                ) : null}
                <div className="text-sm">
                  <div className="font-semibold">
                    {article.columnist ? (
                      <Link href={`/colunistas/${article.columnist.slug}`} className="hover:text-primary">{article.columnist.name}</Link>
                    ) : (
                      article.author?.full_name ?? "Redação"
                    )}
                  </div>
                  <div className="text-xs text-muted">
                    <time dateTime={article.published_at ?? undefined}>{formatDate(article.published_at, "datetime")}</time>
                    {updated && <span> · Atualizado em {formatDate(updated, "datetime")}</span>}
                    <span> · {article.reading_time} min de leitura</span>
                  </div>
                </div>
              </div>
              <div className="ml-auto">
                <ShareButtons url={url} title={article.title} />
              </div>
            </div>
          </header>

          {article.cover_url && (
            <figure className="mt-6">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius)] bg-surface">
                <Image src={article.cover_url} alt={article.cover_alt ?? article.title} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
              </div>
              {(article.cover_caption || article.cover_credit) && (
                <figcaption className="mt-2 text-xs text-muted">
                  {article.cover_caption}
                  {article.cover_credit && <span className="ml-1 uppercase tracking-wide">— {article.cover_credit}</span>}
                </figcaption>
              )}
            </figure>
          )}

          <AdSlot position="in_article" className="mt-6" />

          <div className="prose-article max-w-3xl mt-8" dangerouslySetInnerHTML={{ __html: article.content }} />

          {tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Link key={t.id} href={`/tag/${t.slug}`} className="text-xs font-medium bg-surface px-3 py-1.5 rounded-full hover:bg-secondary hover:text-white transition">
                  #{t.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-y border-black/10 py-4">
            <span className="text-sm font-semibold">Compartilhe esta matéria</span>
            <ShareButtons url={url} title={article.title} />
          </div>

          <AdSlot position="article_end" className="mt-6" />

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="section-title">Relacionadas</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {related.map((a) => (
                  <ArticleCard key={a.id} article={a} size="sm" />
                ))}
              </div>
            </section>
          )}

          {moreFromCategory.length > 0 && article.category && (
            <section className="mt-12">
              <h2 className="section-title">Mais de {article.category.name}</h2>
              {moreFromCategory.map((a) => (
                <ArticleRow key={a.id} article={a} />
              ))}
            </section>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <div className="lg:sticky lg:top-24 space-y-8">
            <AdSlot position="sidebar" />
            {mostRead.length > 0 && (
              <div>
                <h2 className="section-title">Mais lidas</h2>
                {mostRead.map((a, i) => (
                  <ArticleCompact key={a.id} article={a} index={i} />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
