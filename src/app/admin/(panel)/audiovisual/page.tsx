import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { PageHeader, Alert } from "@/components/admin/ui";
import { AudiovisualManager } from "@/components/admin/AudiovisualManager";
import type { Episode, Show } from "@/lib/types";

export default async function AudiovisualAdmin({ searchParams }: { searchParams: Promise<{ msg?: string; tab?: string; edit?: string }> }) {
  await requirePermission("audiovisual.manage");
  const { msg, tab = "episodios", edit } = await searchParams;
  const supabase = await createClient();
  const [{ data: shows }, { data: episodes }] = await Promise.all([
    supabase.from("shows").select("*").order("sort_order"),
    supabase.from("episodes").select("*, show:shows(name)").order("published_at", { ascending: false, nullsFirst: true }).limit(200),
  ]);
  return (
    <div>
      <PageHeader title="Vídeos e podcasts" description="Organize episódios por programas ou séries. Vídeos do YouTube/Vimeo são incorporados automaticamente." />
      {msg && <div className="mb-4"><Alert kind="success">{msg}</Alert></div>}
      <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit text-sm mb-4">
        <Link href="?tab=episodios" className={`px-3 py-1.5 rounded-md ${tab === "episodios" ? "bg-slate-900 text-white" : ""}`}>Episódios</Link>
        <Link href="?tab=programas" className={`px-3 py-1.5 rounded-md ${tab === "programas" ? "bg-slate-900 text-white" : ""}`}>Programas / séries</Link>
      </div>
      <AudiovisualManager tab={tab as "episodios" | "programas"} shows={(shows ?? []) as Show[]} episodes={(episodes ?? []) as unknown as Episode[]} editId={edit} />
    </div>
  );
}
