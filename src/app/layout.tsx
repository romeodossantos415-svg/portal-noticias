import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seo?.default_title ?? s.identity?.name ?? "Portal", template: s.seo?.title_template ?? "%s" },
    description: s.seo?.default_description ?? s.identity?.description,
    icons: s.identity?.favicon_url ? { icon: s.identity.favicon_url } : undefined,
    verification: s.seo?.google_site_verification ? { google: s.seo.google_site_verification } : undefined,
    alternates: { types: { "application/rss+xml": siteUrl("/feed.xml") } },
  };
}

function fontHref(families: string[]) {
  const fam = families
    .filter(Boolean)
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700;800`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${fam}&display=swap`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const t = s.theme ?? ({} as typeof s.theme);
  const heading = t.font_heading || "Playfair Display";
  const body = t.font_body || "Inter";
  const vars = `
    :root{
      --color-primary:${t.primary ?? "#b91c1c"};
      --color-secondary:${t.secondary ?? "#111827"};
      --color-accent:${t.accent ?? "#f59e0b"};
      --color-bg:${t.background ?? "#ffffff"};
      --color-surface:${t.surface ?? "#f5f5f4"};
      --color-text:${t.text ?? "#111827"};
      --color-muted:${t.muted ?? "#6b7280"};
      --font-heading:"${heading}", Georgia, serif;
      --font-body:"${body}", system-ui, sans-serif;
      --heading-scale:${t.heading_scale ?? 1};
      --radius:${t.radius ?? "4px"};
    }`;
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={fontHref([heading, body])} />
        <style dangerouslySetInnerHTML={{ __html: vars }} />
        {s.seo?.ga_measurement_id ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${s.seo.ga_measurement_id}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.seo.ga_measurement_id}');`,
              }}
            />
          </>
        ) : null}
        {s.seo?.adsense_client ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${s.seo.adsense_client}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
