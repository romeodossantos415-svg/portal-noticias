import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { MenuManager } from "@/components/admin/MenuManager";

export default async function MenusPage({ searchParams }: { searchParams: Promise<{ menu?: string }> }) {
  await requirePermission("menus.manage");
  const { menu = "header" } = await searchParams;
  const supabase = await createClient();
  const [{ data: items }, { data: cats }, { data: pages }] = await Promise.all([
    supabase.from("menu_items").select("*").eq("menu_key", menu).order("sort_order"),
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("pages").select("id, title").order("title"),
  ]);
  return (
    <div>
      <PageHeader title="Menus e abas" description="As alterações aparecem imediatamente no site. Arraste para reordenar; use “Item pai” para criar submenus." />
      <MenuManager menuKey={menu} items={items ?? []} categories={cats ?? []} pages={pages ?? []} />
    </div>
  );
}
