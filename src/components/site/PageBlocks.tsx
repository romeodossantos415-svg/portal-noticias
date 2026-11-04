import Link from "next/link";
import type { PageBlock } from "@/lib/types";
import { toEmbedUrl } from "@/lib/utils";

export function RenderPageBlocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <div className="space-y-10">
      {blocks.map((b) => {
        switch (b.type) {
          case "heading": {
            const Tag = (`h${b.level ?? 2}` as "h1" | "h2" | "h3");
            const size = b.level === 1 ? "text-4xl" : b.level === 3 ? "text-xl" : "text-2xl";
            return (
              <Tag key={b.id} className={`headline ${size}`}>
                {b.text}
              </Tag>
            );
          }
          case "text":
            return <div key={b.id} className="prose-article" dangerouslySetInnerHTML={{ __html: b.html }} />;
          case "image":
            return (
              <figure key={b.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.url} alt={b.alt ?? ""} className="w-full rounded-[var(--radius)]" loading="lazy" />
                {b.caption && <figcaption className="text-xs text-muted mt-2">{b.caption}</figcaption>}
              </figure>
            );
          case "banner":
            return (
              <div key={b.id} className="relative overflow-hidden rounded-[var(--radius)] bg-secondary text-white p-8 md:p-12 min-h-[240px] flex items-end">
                {b.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                )}
                <div className="relative space-y-3 max-w-2xl">
                  <h2 className="headline text-3xl">{b.title}</h2>
                  {b.subtitle && <p className="text-white/80">{b.subtitle}</p>}
                  {b.cta_label && b.cta_url && (
                    <Link href={b.cta_url} className="inline-block bg-primary px-5 py-2.5 font-semibold rounded-[var(--radius)]">
                      {b.cta_label}
                    </Link>
                  )}
                </div>
              </div>
            );
          case "columns":
            return (
              <div key={b.id} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {b.items.map((c, i) => (
                  <div key={i} className="space-y-2">
                    <h3 className="headline text-xl">{c.title}</h3>
                    <div className="prose-article !text-base" dangerouslySetInnerHTML={{ __html: c.html }} />
                  </div>
                ))}
              </div>
            );
          case "team":
            return (
              <div key={b.id} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {b.members.map((m, i) => (
                  <div key={i} className="text-center space-y-2">
                    {m.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photo_url} alt={m.name} className="h-28 w-28 rounded-full object-cover mx-auto" />
                    ) : (
                      <div className="h-28 w-28 rounded-full bg-surface mx-auto flex items-center justify-center font-heading text-3xl">{m.name[0]}</div>
                    )}
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-sm text-muted">{m.role}</div>
                  </div>
                ))}
              </div>
            );
          case "embed": {
            const url = toEmbedUrl(b.url);
            return url ? (
              <div key={b.id} className="aspect-video rounded-[var(--radius)] overflow-hidden bg-black">
                <iframe src={url} className="w-full h-full" allowFullScreen title="Conteúdo incorporado" />
              </div>
            ) : null;
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
