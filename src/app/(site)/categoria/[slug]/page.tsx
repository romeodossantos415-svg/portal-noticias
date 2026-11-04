import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticlesByCategory, getCategoryBySlug, getMostRead } from "@/lib/data";
import { ArticleCard, ArticleCompact, ArticleRow } from "@/components/site/ArticleCard";
import { Pagination } from "@/components/site/Pagination";
import { AdSlot } from "@/components/site/AdSlot";

export const revalidate = 60;
const PER_PAGE = 12;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategoryBySlug(slug);
  return c ? { title: c.name, description: c.description ?? `Notícias de ${c.name}` } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: p } = await searchParams;
  const page = Math.max(1, Number(p ?? 1));
  const category = await getCategoryBySlug(slug);
  if (!category || !category.is_active) notFound();
  const [{ articles, total }, mostRead] = await Promise.all([getArticlesByCategory(category.id, PER_PAGE, (page - 1) * PER_PAGE), getMostRead(5)]);
  const [first, ...rest] = page === 1 ? articles : [null, ...articles];

  return (
    <div className="container-site mt-8">
      <header className="relative border-b-4 border-secondary pb-5 mb-8 flex items-end gap-5">
        {category.image_url && (
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-[var(--radius)] hidden md:block">
            <Image src={category.image_url} alt="" fill className="object-cover" />
          </div>
        )}
        <div>
          <h1 className="headline text-3xl md:text-5xl" style={{ color: category.color ?? undefined }}>
            {category.name}
          </h1>
          {category.description && <p className="text-muted mt-2 max-w-2xl">{category.description}</p>}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {!articles.length && <p className="text-muted">Nenhuma notícia publicada nesta editoria ainda.</p>}
          {first && (
            <div className="mb-8">
              <ArticleCard article={first} size="lg" priority />
            </div>
          )}
          {rest.filter(Boolean).map((a) => (
            <ArticleRow key={a!.id} article={a!} />
          ))}
          <Pagination page={page} total={total} perPage={PER_PAGE} basePath={`/categoria/${slug}`} />
        </div>
        <aside className="lg:col-span-4 space-y-8">
          <AdSlot position="sidebar" />
          {mostRead.length > 0 && (
            <div>
              <h2 className="section-title">Mais lidas</h2>
              {mostRead.map((a, i) => (
                <ArticleCompact key={a.id} article={a} index={i} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
