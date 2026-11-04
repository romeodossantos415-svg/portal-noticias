import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function CategoriesPage() {
  await requirePermission("categories.manage");
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <div>
      <PageHeader title="Categorias (editorias)" description="Crie, renomeie, reordene e configure como cada editoria aparece na página inicial." />
      <CategoryManager categories={data ?? []} />
    </div>
  );
}
