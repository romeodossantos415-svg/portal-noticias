"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Newspaper, Star, FolderTree, Menu as MenuIcon, FileText, Palette, Image as ImageIcon,
  Users, PenLine, Video, Megaphone, Link2, Settings, ScrollText, ChevronDown, ChevronUp,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

const NAV: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; perm?: string | string[]; group?: string }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/noticias", label: "Notícias", icon: Newspaper, group: "Conteúdo" },
  { href: "/admin/destaques", label: "Destaques", icon: Star, perm: "featured.manage", group: "Conteúdo" },
  { href: "/admin/categorias", label: "Categorias", icon: FolderTree, perm: "categories.manage", group: "Conteúdo" },
  { href: "/admin/colunistas", label: "Colunistas", icon: PenLine, perm: "columnists.manage", group: "Conteúdo" },
  { href: "/admin/audiovisual", label: "Vídeos e podcasts", icon: Video, perm: "audiovisual.manage", group: "Conteúdo" },
  { href: "/admin/midia", label: "Biblioteca de mídia", icon: ImageIcon, perm: "media.upload", group: "Conteúdo" },
  { href: "/admin/paginas", label: "Páginas", icon: FileText, perm: "pages.manage", group: "Site" },
  { href: "/admin/menus", label: "Menus", icon: MenuIcon, perm: "menus.manage", group: "Site" },
  { href: "/admin/personalizar", label: "Personalizar site", icon: Palette, perm: "appearance.manage", group: "Site" },
  { href: "/admin/publicidade", label: "Publicidade", icon: Megaphone, perm: "ads.manage", group: "Site" },
  { href: "/admin/links", label: "Página de links", icon: Link2, perm: "links.manage", group: "Site" },
  { href: "/admin/usuarios", label: "Usuários", icon: Users, perm: "users.manage", group: "Administração" },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, perm: "settings.manage", group: "Administração" },
  { href: "/admin/atividades", label: "Registro de atividades", icon: ScrollText, perm: "logs.view", group: "Administração" },
];

export function AdminNav({ perms, role }: { perms: string[]; role: UserRole }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const set = new Set(perms);
  const visible = NAV.filter((n) => !n.perm || role === "master" || (Array.isArray(n.perm) ? n.perm.some((p) => set.has(p)) : set.has(n.perm)));
  const groups = [...new Set(visible.map((n) => n.group))];
  return (
    <nav className="flex-1 overflow-y-auto">
      <button onClick={() => setOpen(!open)} className="lg:hidden w-full flex items-center justify-between px-5 py-3 text-sm font-medium border-b border-white/10">
        Menu do painel {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <div className={`${open ? "block" : "hidden"} lg:block py-2`}>
        {groups.map((g) => (
          <div key={g ?? "root"} className="mb-2">
            {g && <div className="px-5 pt-3 pb-1 text-[10px] uppercase tracking-widest text-slate-500">{g}</div>}
            {visible
              .filter((n) => n.group === g)
              .map((n) => {
                const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-5 py-2 text-sm transition ${active ? "bg-white/10 text-white border-r-2 border-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                  >
                    <n.icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                );
              })}
          </div>
        ))}
      </div>
    </nav>
  );
}
