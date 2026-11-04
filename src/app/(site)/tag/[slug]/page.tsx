import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesByTag } from "@/lib/data";
import { ArticleRow } from "@/components/site/ArticleCard";

export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { tag } = await getArticlesByTag(slug, 1);
  return tag ? { title: `#${tag.name}` } : {};
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const { tag, articles } = await getArticlesByTag(slug, 40);
  if (!tag) notFound();
  return (
    <div className="container-site mt-8 max-w-4xl">
      <h1 className="section-title text-3xl">#{tag.name}</h1>
      {!articles.length && <p className="text-muted">Nenhuma notícia com esta tag.</p>}
      {articles.map((a) => (
        <ArticleRow key={a.id} article={a} />
      ))}
    </div>
  );
}
