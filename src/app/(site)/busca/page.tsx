import type { Metadata } from "next";
import { searchArticles } from "@/lib/data";
import { ArticleRow } from "@/components/site/ArticleCard";
import { SearchBox } from "@/components/site/SearchBox";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Busca", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q = "", page: p } = await searchParams;
  const page = Math.max(1, Number(p ?? 1));
  const results = q.trim() ? await searchArticles(q.trim(), 20, (page - 1) * 20) : [];
  return (
    <div className="container-site mt-8 max-w-4xl">
      <h1 className="headline text-3xl mb-4">Busca</h1>
      <div className="max-w-xl mb-8">
        <SearchBox defaultValue={q} />
      </div>
      {q && (
        <p className="text-sm text-muted mb-4">
          {results.length ? `${results.length} resultado(s) para` : "Nenhum resultado para"} <strong>“{q}”</strong>
        </p>
      )}
      {results.map((a) => (
        <ArticleRow key={a.id} article={a} />
      ))}
    </div>
  );
}
