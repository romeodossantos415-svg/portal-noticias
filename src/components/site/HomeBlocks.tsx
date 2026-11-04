import Link from "next/link";
import Image from "next/image";
import type { Article, Category, Columnist, Episode, HomeBlock, SiteSettings } from "@/lib/types";
import { ArticleCard, ArticleCompact, ArticleOverlay, ArticleRow, Byline, CategoryTag, Cover } from "./ArticleCard";
import { AdSlot } from "./AdSlot";
import { getArticlesByCategory, getEpisodes, getLatestArticles, getLatestColumnistArticles, getMostRead } from "@/lib/data";
import { Play, Mic } from "lucide-react";
import { formatDate } from "@/lib/utils";

/* ---------- Faixa de últimas ---------- */
export function Ticker({ items, settings }: { items: Article[]; settings: SiteSettings["ticker"] }) {
  if (!settings?.enabled || !items.length) return null;
  const doubled = [...items, ...items];
  return (
    <div className="bg-secondary text-white text-sm overflow-hidden">
      <div className="container-site flex items-stretch">
        <div className="bg-primary px-3 flex items-center font-bold uppercase text-xs tracking-wider shrink-0 -ml-4 md:-ml-6 pl-4 md:pl-6">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          {settings.label || "Últimas"}
        </div>
        <div className="overflow-hidden flex-1 py-2" style={{ ["--ticker-speed" as string]: `${settings.speed || 60}s` }}>
          <div className="ticker-track">
            {doubled.map((a, i) => (
              <Link key={`${a.id}-${i}`} href={`/noticia/${a.slug}`} className="px-6 whitespace-nowrap hover:underline underline-offset-4 border-r border-white/15">
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Manchetes ---------- */
export function Hero({ main, secondary }: { main: Article | null; secondary: Article[] }) {
  if (!main && !secondary.length) return null;
  const sec = secondary.slice(0, 4);
  return (
    <section className="container-site mt-6 md:mt-8">
      <div className="grid gap-6 lg:grid-cols-12">
        {main && (
          <div className="lg:col-span-8">
            <article className="group fade-up">
              <Link href={`/noticia/${main.slug}`}>
                <Cover article={main} priority sizes="(max-width: 1024px) 100vw, 66vw" ratio="aspect-[16/9]" />
              </Link>
              <div className="mt-4 space-y-2">
                <CategoryTag article={main} />
                <h1 className="headline text-3xl md:text-[2.6rem] group-hover:text-primary transition-colors" style={{ fontSize: `calc(clamp(1.9rem, 4vw, 2.6rem) * var(--heading-scale))` }}>
                  <Link href={`/noticia/${main.slug}`}>{main.title}</Link>
                </h1>
                {main.subtitle && <p className="text-base md:text-lg text-muted leading-relaxed">{main.subtitle}</p>}
                <Byline article={main} />
              </div>
            </article>
          </div>
        )}
        <div className={`${main ? "lg:col-span-4" : "lg:col-span-12"} grid gap-5 sm:grid-cols-2 lg:grid-cols-1`}>
          {sec.map((a, i) => (i < 2 ? <ArticleOverlay key={a.id} article={a} /> : <ArticleCardMini key={a.id} article={a} />))}
        </div>
      </div>
    </section>
  );
}

function ArticleCardMini({ article }: { article: Article }) {
  return (
    <article className="group flex gap-3 lg:border-t border-black/10 lg:pt-4">
      <Link href={`/noticia/${article.slug}`} className="shrink-0 w-28">
        <Cover article={article} sizes="120px" ratio="aspect-[4/3]" />
      </Link>
      <div className="space-y-1 min-w-0">
        <CategoryTag article={article} />
        <h3 className="headline text-base group-hover:text-primary line-clamp-3">
          <Link href={`/noticia/${article.slug}`}>{article.title}</Link>
        </h3>
      </div>
    </article>
  );
}

/* ---------- Chamadas ---------- */
export function Highlights({ items }: { items: Article[] }) {
  if (!items.length) return null;
  return (
    <section className="container-site mt-12">
      <h2 className="section-title">Em destaque</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}

/* ---------- Banner editorial ---------- */
export function EditorialBanner({ article }: { article: Article | null }) {
  if (!article) return null;
  return (
    <section className="container-site mt-12">
      <article className="relative overflow-hidden rounded-[var(--radius)] bg-secondary text-white min-h-[320px] md:min-h-[420px] flex items-end">
        {article.cover_url && <Image src={article.cover_url} alt={article.cover_alt ?? article.title} fill sizes="100vw" className="object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="relative p-6 md:p-10 max-w-3xl space-y-3">
          <span className="kicker !text-accent">Especial</span>
          <h2 className="headline text-2xl md:text-4xl">
            <Link href={`/noticia/${article.slug}`} className="hover:underline underline-offset-4">
              {article.title}
            </Link>
          </h2>
          {article.subtitle && <p className="text-white/80 md:text-lg">{article.subtitle}</p>}
          <Byline article={article} light />
        </div>
      </article>
    </section>
  );
}

/* ---------- Bloco de editoria ---------- */
export async function CategoryBlock({ category }: { category: Category }) {
  const { articles } = await getArticlesByCategory(category.id, category.home_limit || 4);
  if (!articles.length) return null;
  const [first, ...rest] = articles;
  const layout = category.home_layout || "grid";
  return (
    <section className="container-site mt-12">
      <div className="section-title justify-between">
        <span className="flex items-center gap-3">
          <span style={{ color: category.color ?? undefined }}>{category.name}</span>
        </span>
        <Link href={`/categoria/${category.slug}`} className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-primary font-body">
          Ver tudo →
        </Link>
      </div>
      {layout === "list" ? (
        <div className="grid gap-x-8 md:grid-cols-2">
          {articles.map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
        </div>
      ) : layout === "featured" ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ArticleCard article={first} size="lg" />
          </div>
          <div className="lg:col-span-5 divide-y divide-black/10">
            {rest.map((a) => (
              <ArticleRow key={a.id} article={a} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} size="sm" />
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- Colunistas ---------- */
export async function ColumnistsBlock({ columnists }: { columnists: Columnist[] }) {
  const articles = await getLatestColumnistArticles(4);
  if (!columnists.length && !articles.length) return null;
  return (
    <section className="mt-12 bg-surface py-10">
      <div className="container-site">
        <div className="section-title justify-between">
          <span>Opinião e colunas</span>
          <Link href="/colunistas" className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-primary font-body">
            Todos os colunistas →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {articles.map((a) => (
            <article key={a.id} className="group bg-bg p-5 rounded-[var(--radius)] border border-black/5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {a.columnist?.photo_url ? (
                  <Image src={a.columnist.photo_url} alt={a.columnist.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-secondary text-white flex items-center justify-center font-heading font-bold">{a.columnist?.name?.[0]}</div>
                )}
                <div className="min-w-0">
                  <Link href={`/colunistas/${a.columnist?.slug}`} className="font-semibold text-sm hover:text-primary block truncate">
                    {a.columnist?.name}
                  </Link>
                  <span className="text-xs text-muted truncate block">{a.columnist?.specialty}</span>
                </div>
              </div>
              <h3 className="headline text-lg italic group-hover:text-primary line-clamp-3">
                <Link href={`/noticia/${a.slug}`}>“{a.title}”</Link>
              </h3>
              <span className="text-xs text-muted mt-auto">{formatDate(a.published_at)}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Audiovisual ---------- */
export async function AudiovisualBlock() {
  const episodes = await getEpisodes(4);
  if (!episodes.length) return null;
  return (
    <section className="container-site mt-12">
      <div className="section-title justify-between">
        <span>Vídeos e podcasts</span>
        <Link href="/videos" className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-primary font-body">
          Ver todos →
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {episodes.map((e) => (
          <EpisodeCard key={e.id} episode={e} />
        ))}
      </div>
    </section>
  );
}

export function EpisodeCard({ episode }: { episode: Episode }) {
  return (
    <article className="group">
      <Link href={`/videos/${episode.slug}`} className="relative block aspect-video overflow-hidden rounded-[var(--radius)] bg-secondary img-zoom">
        {episode.cover_url && <Image src={episode.cover_url} alt={episode.title} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-12 w-12 rounded-full bg-white/90 text-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition">
            {episode.type === "audio" ? <Mic className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </span>
        </span>
      </Link>
      <div className="mt-3 space-y-1">
        {episode.show && <span className="kicker">{episode.show.name}</span>}
        <h3 className="headline text-base group-hover:text-primary line-clamp-2">
          <Link href={`/videos/${episode.slug}`}>{episode.title}</Link>
        </h3>
        <div className="text-xs text-muted">
          {episode.guest_name && <span>Com {episode.guest_name} · </span>}
          {formatDate(episode.published_at, "short")}
        </div>
      </div>
    </article>
  );
}

/* ---------- Últimas + lateral ---------- */
export async function LatestBlock({ excludeIds }: { excludeIds: string[] }) {
  const [latest, mostRead] = await Promise.all([getLatestArticles(10, 0, excludeIds), getMostRead(5)]);
  if (!latest.length) return null;
  return (
    <section className="container-site mt-12 grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <h2 className="section-title">Últimas notícias</h2>
        <div>
          {latest.map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
        </div>
        <Link href="/ultimas" className="inline-block mt-6 border border-secondary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-secondary hover:text-white transition rounded-[var(--radius)]">
          Carregar mais notícias
        </Link>
      </div>
      <aside className="lg:col-span-4 space-y-8">
        {mostRead.length > 0 && (
          <div>
            <h2 className="section-title">Mais lidas</h2>
            {mostRead.map((a, i) => (
              <ArticleCompact key={a.id} article={a} index={i} />
            ))}
          </div>
        )}
        <AdSlot position="sidebar" />
      </aside>
    </section>
  );
}

/* ---------- Renderizador de blocos ---------- */
export async function RenderHomeBlocks({
  blocks,
  featured,
  settings,
  categories,
  columnists,
}: {
  blocks: HomeBlock[];
  featured: Record<string, Article[]>;
  settings: SiteSettings;
  categories: Category[];
  columnists: Columnist[];
}) {
  const usedIds = [
    ...(featured.hero_main ?? []),
    ...(featured.hero_secondary ?? []),
    ...(featured.home_highlights ?? []),
  ].map((a) => a.id);

  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "ticker":
            return <Ticker key={i} items={featured.ticker ?? []} settings={settings.ticker} />;
          case "hero":
            return <Hero key={i} main={featured.hero_main?.[0] ?? null} secondary={featured.hero_secondary ?? []} />;
          case "highlights":
            return <Highlights key={i} items={featured.home_highlights ?? []} />;
          case "banner":
            return <EditorialBanner key={i} article={featured.home_banner?.[0] ?? null} />;
          case "categories":
            return categories.filter((c) => c.show_on_home).map((c) => <CategoryBlock key={`${i}-${c.id}`} category={c} />);
          case "category": {
            const c = categories.find((x) => x.id === b.category_id);
            return c ? <CategoryBlock key={i} category={{ ...c, home_layout: b.layout ?? c.home_layout, home_limit: b.limit ?? c.home_limit }} /> : null;
          }
          case "columnists":
            return <ColumnistsBlock key={i} columnists={columnists} />;
          case "audiovisual":
            return <AudiovisualBlock key={i} />;
          case "latest":
            return <LatestBlock key={i} excludeIds={usedIds} />;
          case "ad":
            return <AdSlot key={i} position={b.position} className="mt-8" />;
          default:
            return null;
        }
      })}
    </>
  );
}
