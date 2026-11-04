import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLatestArticles, getLinkButtons, getSettings } from "@/lib/data";
import { SocialIcons } from "@/components/site/SocialIcons";
import { ExternalLink } from "lucide-react";

export const revalidate = 60;
export const metadata: Metadata = { title: "Links", robots: { index: false } };

export default async function LinksPage() {
  const s = await getSettings();
  const lp = s.links_page;
  if (!lp?.enabled) notFound();
  const [buttons, latest] = await Promise.all([getLinkButtons(), lp.show_latest_articles ? getLatestArticles(lp.show_latest_articles) : Promise.resolve([])]);
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          {lp.avatar_url || s.identity?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lp.avatar_url ?? s.identity.logo_url ?? ""} alt={lp.title} className="h-24 w-24 rounded-full object-cover mx-auto border-4 border-bg shadow" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-secondary text-white mx-auto flex items-center justify-center font-heading text-3xl font-bold">{(lp.title ?? "P")[0]}</div>
          )}
          <h1 className="headline text-2xl">{lp.title}</h1>
          {lp.subtitle && <p className="text-sm text-muted">{lp.subtitle}</p>}
          <SocialIcons links={s.social} className="justify-center" size="h-5 w-5" />
        </div>
        <div className="space-y-3">
          {buttons.map((b) => (
            <a
              key={b.id}
              href={b.url}
              target={b.url.startsWith("http") ? "_blank" : undefined}
              rel="noopener"
              className={`flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-full font-semibold text-sm transition shadow-sm hover:-translate-y-0.5 ${
                b.style === "primary" ? "bg-primary text-white" : b.style === "dark" ? "bg-secondary text-white" : "bg-bg border border-black/10 hover:border-secondary"
              }`}
            >
              {b.label}
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          ))}
        </div>
        {latest.length > 0 && (
          <div className="space-y-3 pt-4">
            <h2 className="kicker text-center">Últimas notícias</h2>
            {latest.map((a) => (
              <Link key={a.id} href={`/noticia/${a.slug}`} className="flex gap-3 bg-bg rounded-2xl p-3 border border-black/10 hover:border-secondary transition">
                {a.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.cover_url} alt="" className="h-16 w-20 object-cover rounded-xl shrink-0" />
                )}
                <span className="headline text-sm line-clamp-3 self-center">{a.title}</span>
              </Link>
            ))}
          </div>
        )}
        <p className="text-center text-xs text-muted pt-6">
          <Link href="/" className="hover:underline">{s.identity?.name}</Link>
        </p>
      </div>
    </div>
  );
}
