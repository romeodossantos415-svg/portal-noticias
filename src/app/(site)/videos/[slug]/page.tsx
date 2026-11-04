import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEpisodeBySlug, getEpisodes } from "@/lib/data";
import { formatDate, formatDuration, siteUrl, toEmbedUrl } from "@/lib/utils";
import { EpisodeCard } from "@/components/site/HomeBlocks";
import { ShareButtons } from "@/components/site/ShareButtons";

export const revalidate = 120;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEpisodeBySlug(slug);
  return e ? { title: e.title, description: e.description ?? undefined, openGraph: { images: e.cover_url ? [e.cover_url] : undefined } } : {};
}

export default async function EpisodePage({ params }: Props) {
  const { slug } = await params;
  const e = await getEpisodeBySlug(slug);
  if (!e) notFound();
  const more = (await getEpisodes(5, e.show_id ?? undefined)).filter((x) => x.id !== e.id).slice(0, 4);
  const embed = toEmbedUrl(e.embed_url);
  return (
    <div className="container-site mt-8 max-w-4xl">
      {e.show && (
        <Link href={`/videos?programa=${e.show.slug}`} className="kicker">
          {e.show.name}
        </Link>
      )}
      <h1 className="headline text-3xl md:text-4xl mt-2 mb-4">{e.title}</h1>
      {embed && e.type === "video" ? (
        <div className="aspect-video rounded-[var(--radius)] overflow-hidden bg-black">
          <iframe src={embed} title={e.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      ) : null}
      {e.type === "audio" && (
        <div className="flex flex-col md:flex-row gap-6 items-start bg-surface p-6 rounded-[var(--radius)]">
          {e.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.cover_url} alt={e.title} className="w-full md:w-48 aspect-square object-cover rounded-[var(--radius)]" />
          )}
          <div className="flex-1 w-full space-y-3">
            {e.audio_url ? <audio controls preload="metadata" className="w-full" src={e.audio_url} /> : embed ? <iframe src={embed} title={e.title} className="w-full h-40 rounded" /> : null}
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
        {e.guest_name && <span>Entrevistado: <strong className="text-ink">{e.guest_name}</strong></span>}
        <span>{formatDate(e.published_at)}</span>
        {e.duration_seconds && <span>{formatDuration(e.duration_seconds)}</span>}
        <div className="ml-auto">
          <ShareButtons url={siteUrl(`/videos/${e.slug}`)} title={e.title} />
        </div>
      </div>
      {e.description && <div className="prose-article mt-6 whitespace-pre-line">{e.description}</div>}
      {more.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title">Mais episódios</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {more.map((x) => (
              <EpisodeCard key={x.id} episode={x} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
