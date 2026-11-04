import Link from "next/link";
import { getCategories, getFooterPages, getMenu, getSettings } from "@/lib/data";
import { SocialIcons } from "./SocialIcons";
import { AdSlot } from "./AdSlot";

export async function Footer() {
  const [s, cats, pages, menu] = await Promise.all([getSettings(), getCategories(), getFooterPages(), getMenu("footer")]);
  const f = s.footer ?? ({} as typeof s.footer);
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 bg-secondary text-white">
      <AdSlot position="footer" className="bg-bg" />
      <div className="container-site py-12 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4 space-y-4">
          <Link href="/" className="inline-block">
            {s.identity?.logo_dark_url || s.identity?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.identity.logo_dark_url ?? s.identity.logo_url ?? ""} alt={s.identity.name} className="h-10 w-auto object-contain" />
            ) : (
              <span className="font-heading text-3xl font-black">{s.identity?.name}</span>
            )}
          </Link>
          <p className="text-sm text-white/70 leading-relaxed">{f.about}</p>
          <SocialIcons links={s.social} className="-ml-2 text-white/80" />
        </div>
        <div className="md:col-span-4">
          <h4 className="font-bold uppercase tracking-wider text-xs text-white/60 mb-4">Editorias</h4>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {cats.map((c) => (
              <li key={c.id}>
                <Link href={`/categoria/${c.slug}`} className="text-white/85 hover:text-white hover:underline underline-offset-4">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-bold uppercase tracking-wider text-xs text-white/60 mb-4">Institucional</h4>
          <ul className="space-y-2 text-sm">
            {pages.map((p) => (
              <li key={p.id}>
                <Link href={`/pagina/${p.slug}`} className="text-white/85 hover:text-white hover:underline underline-offset-4">
                  {p.title}
                </Link>
              </li>
            ))}
            {menu.map((m) => (
              <li key={m.id}>
                <Link href={m.href ?? "#"} className="text-white/85 hover:text-white hover:underline underline-offset-4">
                  {m.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/feed.xml" className="text-white/85 hover:text-white hover:underline underline-offset-4">
                RSS
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-2 text-sm space-y-2">
          <h4 className="font-bold uppercase tracking-wider text-xs text-white/60 mb-4">Contato</h4>
          {f.contact_email && (
            <a href={`mailto:${f.contact_email}`} className="block text-white/85 hover:text-white break-all">
              {f.contact_email}
            </a>
          )}
          {f.contact_phone && <p className="text-white/85">{f.contact_phone}</p>}
          {f.address && <p className="text-white/70 text-xs leading-relaxed">{f.address}</p>}
        </div>
      </div>
      {f.expediente && (
        <div className="border-t border-white/10">
          <div className="container-site py-5 text-xs text-white/60 leading-relaxed whitespace-pre-line">
            <strong className="text-white/80">Expediente: </strong>
            {f.expediente}
          </div>
        </div>
      )}
      <div className="border-t border-white/10">
        <div className="container-site py-4 text-xs text-white/50 flex flex-col md:flex-row justify-between gap-2">
          <span>{(f.copyright ?? "© {year}").replace("{year}", String(year))}</span>
          <Link href="/admin" className="hover:text-white">
            Área administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
