import Link from "next/link";
import { getMenu, getSettings } from "@/lib/data";
import { SocialIcons } from "./SocialIcons";
import { MobileNav } from "./MobileNav";
import { SearchBox } from "./SearchBox";
import { ChevronDown } from "lucide-react";

export async function Header() {
  const [s, menu] = await Promise.all([getSettings(), getMenu("header")]);
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Fortaleza" });
  const h = s.header ?? ({} as typeof s.header);

  return (
    <header className={`bg-bg border-b border-black/10 ${h.sticky ? "sticky top-0 z-40" : ""}`}>
      {/* Linha superior */}
      <div className="hidden md:block border-b border-black/5 text-xs text-muted">
        <div className="container-site flex items-center justify-between h-8">
          <span className="capitalize">{h.show_date !== false ? today : ""}</span>
          <div className="flex items-center gap-4">
            {h.show_social !== false && <SocialIcons links={s.social} size="h-3.5 w-3.5" />}
            {h.cta_label && h.cta_url && (
              <Link href={h.cta_url} className="bg-primary text-white px-3 py-1 rounded-[var(--radius)] font-semibold hover:opacity-90 transition">
                {h.cta_label}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="container-site flex items-center justify-between py-3 md:py-5">
        <MobileNav menu={menu} social={s.social} />
        <Link href="/" className="flex items-center gap-3 md:mx-auto" aria-label={s.identity?.name}>
          {s.identity?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.identity.logo_url} alt={s.identity.name} className="h-9 md:h-14 w-auto object-contain" />
          ) : (
            <span className="font-heading text-3xl md:text-5xl font-black tracking-tight text-secondary">{s.identity?.name ?? "Portal"}</span>
          )}
        </Link>
        <div className="hidden md:block w-56">{h.show_search !== false && <SearchBox />}</div>
        <div className="md:hidden w-9" />
      </div>

      {/* Menu */}
      <nav className="hidden md:block border-t border-black/10" aria-label="Navegação principal">
        <div className="container-site">
          <ul className="flex items-center justify-center gap-0 overflow-x-auto">
            {menu.map((item) => (
              <li key={item.id} className="relative group">
                <Link
                  href={item.href ?? "#"}
                  target={item.open_new_tab ? "_blank" : undefined}
                  className="flex items-center gap-1 px-3 py-3 text-[0.82rem] font-semibold uppercase tracking-wider text-ink hover:text-primary border-b-2 border-transparent hover:border-primary transition whitespace-nowrap"
                >
                  {item.label}
                  {item.children?.length ? <ChevronDown className="h-3 w-3" /> : null}
                </Link>
                {item.children?.length ? (
                  <ul className="absolute left-0 top-full min-w-48 bg-bg border border-black/10 shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-50">
                    {item.children.map((c) => (
                      <li key={c.id}>
                        <Link href={c.href ?? "#"} className="block px-4 py-2 text-sm hover:bg-surface hover:text-primary">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
