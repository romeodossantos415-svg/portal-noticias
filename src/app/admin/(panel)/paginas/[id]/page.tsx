import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { PageHeader, ConfirmButton } from "@/components/admin/ui";
import { PageEditor } from "@/components/admin/PageEditor";
import { deletePage } from "../actions";
import type { Page } from "@/lib/types";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("pages.manage");
  const { id } = await params;
  let page: Page | null = null;
  if (id !== "nova") {
    const supabase = await createClient();
    const { data } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    page = data as Page;
  }
  return (
    <div>
      <PageHeader
        title={page ? `Editar: ${page.title}` : "Nova página"}
        actions={page && !page.is_system ? (
          <form action={deletePage}><input type="hidden" name="id" value={page.id} /><ConfirmButton message="Excluir esta página?">Excluir</ConfirmButton></form>
        ) : null}
      />
      <PageEditor page={page} />
    </div>
  );
}
