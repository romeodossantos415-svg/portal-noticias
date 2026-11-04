import type { Metadata } from "next";
import Link from "next/link";
import { getEpisodes, getShows } from "@/lib/data";
import { EpisodeCard } from "@/components/site/HomeBlocks";

export const revalidate = 120;
export const metadata: Metadata = { title: "Vídeos e podcasts" };

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ programa?: string }> }) {
  const { programa } = await searchParams;
  const shows = await getShows();
  const current = shows.find((s) => s.slug === programa);
  const episodes = await getEpisodes(24, current?.id);
  return (
    <div className="container-site mt-8">
      <h1 className="section-title text-3xl">Vídeos e podcasts</h1>
      {shows.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/videos" className={`px-4 py-1.5 rounded-full text-sm border ${!current ? "bg-secondary text-white border-secondary" : "border-black/15 hover:border-secondary"}`}>Todos</Link>
          {shows.map((s) => (
            <Link key={s.id} href={`/videos?programa=${s.slug}`} className={`px-4 py-1.5 rounded-full text-sm border ${current?.id === s.id ? "bg-secondary text-white border-secondary" : "border-black/15 hover:border-secondary"}`}>
              {s.name}
            </Link>
          ))}
        </div>
      )}
      {current?.description && <p className="text-muted mb-6 max-w-2xl">{current.description}</p>}
      {!episodes.length && <p className="text-muted">Nenhum episódio publicado.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {episodes.map((e) => (
          <EpisodeCard key={e.id} episode={e} />
        ))}
      </div>
    </div>
  );
}
