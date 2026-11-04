import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getColumnists } from "@/lib/data";
import { SocialIcons } from "@/components/site/SocialIcons";

export const revalidate = 300;
export const metadata: Metadata = { title: "Colunistas" };

export default async function ColumnistsPage() {
  const columnists = await getColumnists();
  return (
    <div className="container-site mt-8">
      <h1 className="section-title text-3xl">Colunistas</h1>
      {!columnists.length && <p className="text-muted">Nenhum colunista cadastrado.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {columnists.map((c) => (
          <Link key={c.id} href={`/colunistas/${c.slug}`} className="group flex gap-4 p-5 border border-black/10 rounded-[var(--radius)] hover:border-primary transition">
            {c.photo_url ? (
              <Image src={c.photo_url} alt={c.name} width={80} height={80} className="h-20 w-20 rounded-full object-cover shrink-0" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-secondary text-white flex items-center justify-center font-heading text-2xl font-bold shrink-0">{c.name[0]}</div>
            )}
            <div className="min-w-0">
              <h2 className="headline text-xl group-hover:text-primary">{c.name}</h2>
              <p className="kicker mt-0.5">{c.specialty}</p>
              <p className="text-sm text-muted mt-2 line-clamp-3">{c.bio}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
