import Link from "next/link";

export function Pagination({ page, total, perPage, basePath }: { page: number; total: number; perPage: number; basePath: string }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  const sep = basePath.includes("?") ? "&" : "?";
  return (
    <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Paginação">
      {page > 1 && (
        <Link href={`${basePath}${sep}page=${page - 1}`} className="px-4 py-2 border border-black/15 rounded-[var(--radius)] text-sm hover:bg-secondary hover:text-white">
          ← Anterior
        </Link>
      )}
      <span className="text-sm text-muted px-3">
        Página {page} de {pages}
      </span>
      {page < pages && (
        <Link href={`${basePath}${sep}page=${page + 1}`} className="px-4 py-2 border border-black/15 rounded-[var(--radius)] text-sm hover:bg-secondary hover:text-white">
          Próxima →
        </Link>
      )}
    </nav>
  );
}
