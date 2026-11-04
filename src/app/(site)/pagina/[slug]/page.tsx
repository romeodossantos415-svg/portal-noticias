import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/data";
import { RenderPageBlocks } from "@/components/site/PageBlocks";
import { formatDate } from "@/lib/utils";

export const revalidate = 120;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPageBySlug(slug);
  return p ? { title: p.seo_title || p.title, description: p.seo_description ?? undefined } : {};
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  return (
    <div className="container-site mt-8 max-w-3xl">
      <h1 className="headline text-3xl md:text-5xl mb-2">{page.title}</h1>
      <p className="text-xs text-muted mb-8">Atualizado em {formatDate(page.updated_at)}</p>
      {page.blocks?.length ? <RenderPageBlocks blocks={page.blocks} /> : null}
      {page.content && <div className="prose-article mt-8" dangerouslySetInnerHTML={{ __html: page.content }} />}
    </div>
  );
}
