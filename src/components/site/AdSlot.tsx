import { getAds } from "@/lib/data";
import type { AdPosition } from "@/lib/types";

export async function AdSlot({ position, className = "" }: { position: AdPosition; className?: string }) {
  const ads = await getAds();
  const list = ads[position] ?? [];
  if (!list.length) return null;
  return (
    <div className={`${className}`}>
      <div className="container-site py-4 space-y-4">
        {list.map((ad) => (
          <div key={ad.id} className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted mb-1">Publicidade</div>
            {ad.html_code ? (
              <div dangerouslySetInnerHTML={{ __html: ad.html_code }} />
            ) : ad.image_url ? (
              <a href={`/api/ads/${ad.id}/click`} target="_blank" rel="noopener sponsored" className="inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ad.image_url} alt={ad.name} className="mx-auto max-w-full h-auto rounded-[var(--radius)]" loading="lazy" />
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
