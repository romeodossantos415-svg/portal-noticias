import { requirePermission, getPermissions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export default async function MediaPage() {
  await requirePermission("media.upload");
  const perms = await getPermissions();
  const supabase = await createClient();
  const { data: folders } = await supabase.from("media_folders").select("*").order("name");
  return (
    <div>
      <PageHeader title="Biblioteca de mídia" description="Imagens são otimizadas automaticamente (redimensionadas e convertidas para WebP) no envio." />
      <MediaLibrary folders={folders ?? []} canManage={perms.has("media.manage")} />
    </div>
  );
}
