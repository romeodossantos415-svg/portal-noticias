import { PageHeader } from "@/components/admin/ui";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { loadFormDeps } from "../_data";

export default async function NewArticlePage() {
  const deps = await loadFormDeps();
  return (
    <div>
      <PageHeader title="Nova notícia" />
      <ArticleForm article={null} tags={[]} {...deps} />
    </div>
  );
}
