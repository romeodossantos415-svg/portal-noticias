import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getColumnistArticles, getColumnistBySlug } from "@/lib/data";
import { ArticleRow } from "@/components/site/ArticleCard";
import { Pagination } from "@/components/site/Pagination";
import { SocialIcons } from "@/components/site/SocialIcons";

export const revalidate = 60;
const PER_PAGE = 10;
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getColumnistBySlug(slug);
  return c ? { title: c.name, description: c.bio ?? undefined } : {};
}

export default async function ColumnistPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: p } = await searchParams;
  const page = Math.max(1, Number(p ?? 1));
  const c = await getColumnistBySlug(slug);
  if (!c || !c.is_active) notFound();
  const { articles, total } = await getColumnistArticles(c.id, PER_PAGE, (page - 1) * PER_PAGE);
  return (
    <div className="container-site mt-8 max-w-4xl">
      <header className="flex flex-col md:flex-row gap-6 items-start md:items-center border-b border-black/10 pb-8 mb-8">
        {c.photo_url ? (
          <Image src={c.photo_url} alt={c.name} width={140} height={140} className="h-32 w-32 md:h-36 md:w-36 rounded-full object-cover shrink-0" />
        ) : (
          <div className="h-32 w-32 rounded-full bg-secondary text-white flex items-center justify-center font-heading text-4xl font-bold shrink-0">{c.name[0]}</div>
        )}
        <div className="space-y-2">
          <p className="kicker">{c.specialty}</p>
          <h1 className="headline text-3xl md:text-4xl">{c.name}</h1>
          {c.bio && <p className="text-muted leading-relaxed">{c.bio}</p>}
          <SocialIcons links={c.social_links} className="-ml-2" />
        </div>
      </header>
      <h2 className="section-title">Artigos publicados</h2>
      {!articles.length && <p className="text-muted">Nenhum artigo publicado ainda.</p>}
      {articles.map((a) => (
        <ArticleRow key={a.id} article={a} />
      ))}
      <Pagination page={page} total={total} perPage={PER_PAGE} basePath={`/colunistas/${slug}`} />
    </div>
  );
}
