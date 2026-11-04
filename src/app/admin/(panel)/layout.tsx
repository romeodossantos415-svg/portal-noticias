import Link from "next/link";
import { requireUser, getPermissions } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { ROLE_LABELS } from "@/lib/types";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOut } from "../(auth)/actions";
import { ExternalLink, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const [user, perms, s] = await Promise.all([requireUser(), getPermissions(), getSettings()]);
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-[Inter,system-ui,sans-serif] lg:flex">
      <aside className="lg:w-64 shrink-0 bg-slate-900 text-slate-200 lg:min-h-screen flex flex-col">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin" className="font-bold text-white text-lg truncate">
            {s.identity?.name ?? "Portal"}
          </Link>
          <Link href="/" target="_blank" className="text-slate-400 hover:text-white" title="Ver site">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <AdminNav perms={[...perms]} role={user.role} />
        <div className="mt-auto p-4 border-t border-white/10 flex items-center gap-3">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center font-bold">{user.full_name[0]}</div>
          )}
          <div className="min-w-0 flex-1">
            <Link href="/admin/perfil" className="block text-sm font-medium text-white truncate hover:underline">
              {user.full_name}
            </Link>
            <div className="text-xs text-slate-400 truncate">{ROLE_LABELS[user.role]}</div>
          </div>
          <form action={signOut}>
            <button className="text-slate-400 hover:text-white" title="Sair">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="p-4 md:p-8 max-w-7xl">{children}</div>
      </div>
    </div>
  );
}
