import type { Metadata } from "next";
import { getLatestArticles } from "@/lib/data";
import { createPublicClient } from "@/lib/supabase/server";
import { ArticleRow } from "@/components/site/ArticleCard";
import { Pagination } from "@/components/site/Pagination";

export const revalidate = 60;
const PER_PAGE = 20;
export const metadata: Metadata = { title: "Últimas notícias" };

export default async function LatestPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: p } = await searchParams;
  const page = Math.max(1, Number(p ?? 1));
  const supabase = createPublicClient();
  const [articles, { count }] = await Promise.all([
    getLatestArticles(PER_PAGE, (page - 1) * PER_PAGE),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);
  return (
    <div className="container-site mt-8 max-w-4xl">
      <h1 className="section-title text-3xl">Últimas notícias</h1>
      {articles.map((a) => (
        <ArticleRow key={a.id} article={a} />
      ))}
      <Pagination page={page} total={count ?? 0} perPage={PER_PAGE} basePath="/ultimas" />
    </div>
  );
}
