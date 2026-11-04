"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { SocialIcons } from "./SocialIcons";

export function MobileNav({ menu, social }: { menu: MenuItem[]; social: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="p-2 -ml-2">
        <Menu className="h-6 w-6" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-bg shadow-xl flex flex-col fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-black/10">
              <span className="font-heading font-bold text-lg">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form action="/busca" className="p-4 border-b border-black/10 flex gap-2">
              <input name="q" placeholder="Buscar notícias" className="flex-1 border border-black/15 rounded-[var(--radius)] px-3 py-2 text-sm" />
              <button className="bg-secondary text-white px-3 rounded-[var(--radius)]" aria-label="Buscar">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <nav className="flex-1 overflow-y-auto py-2">
              {menu.map((item) => (
                <div key={item.id}>
                  <Link href={item.href ?? "#"} onClick={() => setOpen(false)} className="block px-5 py-3 font-semibold uppercase text-sm tracking-wide border-b border-black/5">
                    {item.label}
                  </Link>
                  {item.children?.map((c) => (
                    <Link key={c.id} href={c.href ?? "#"} onClick={() => setOpen(false)} className="block pl-9 pr-5 py-2.5 text-sm text-muted border-b border-black/5">
                      {c.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
            <div className="p-4 border-t border-black/10">
              <SocialIcons links={social} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
