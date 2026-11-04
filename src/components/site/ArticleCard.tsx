import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/utils";

export function CategoryTag({ article, className = "" }: { article: Article; className?: string }) {
  if (!article.category) return null;
  return (
    <Link href={`/categoria/${article.category.slug}`} className={`kicker hover:underline ${className}`} style={{ color: article.category.color ?? undefined }}>
      {article.category.name}
    </Link>
  );
}

export function Byline({ article, showTime = true, light = false }: { article: Article; showTime?: boolean; light?: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${light ? "text-white/80" : "text-muted"}`}>
      {article.author?.full_name && <span className="font-medium">{article.author.full_name}</span>}
      {article.author?.full_name && showTime && <span aria-hidden>·</span>}
      {showTime && <time dateTime={article.published_at ?? undefined}>{timeAgo(article.published_at)}</time>}
    </div>
  );
}

export function Cover({ article, sizes = "(max-width: 768px) 100vw, 33vw", priority = false, ratio = "aspect-[16/10]" }: { article: Article; sizes?: string; priority?: boolean; ratio?: string }) {
  return (
    <div className={`relative ${ratio} overflow-hidden bg-surface rounded-[var(--radius)] img-zoom`}>
      {article.cover_url ? (
        <Image src={article.cover_url} alt={article.cover_alt ?? article.title} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted/40 font-heading text-4xl">Aa</div>
      )}
    </div>
  );
}

/** Card padrão vertical */
export function ArticleCard({ article, size = "md", priority = false }: { article: Article; size?: "sm" | "md" | "lg"; priority?: boolean }) {
  const titleCls = size === "lg" ? "text-2xl md:text-3xl" : size === "md" ? "text-lg md:text-xl" : "text-base";
  return (
    <article className="group fade-up">
      <Link href={`/noticia/${article.slug}`} className="block">
        <Cover article={article} priority={priority} sizes={size === "lg" ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} />
      </Link>
      <div className="mt-3 space-y-1.5">
        <CategoryTag article={article} />
        <h3 className={`headline ${titleCls} group-hover:text-primary transition-colors`}>
          <Link href={`/noticia/${article.slug}`}>{article.title}</Link>
        </h3>
        {size !== "sm" && article.subtitle && <p className="text-sm text-muted line-clamp-2">{article.subtitle}</p>}
        <Byline article={article} />
      </div>
    </article>
  );
}

/** Card horizontal (lista) */
export function ArticleRow({ article, showImage = true }: { article: Article; showImage?: boolean }) {
  return (
    <article className="group flex gap-4 py-4 border-b border-black/10 last:border-0 fade-up">
      {showImage && (
        <Link href={`/noticia/${article.slug}`} className="shrink-0 w-28 md:w-40">
          <Cover article={article} sizes="160px" ratio="aspect-[4/3]" />
        </Link>
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <CategoryTag article={article} />
        <h3 className="headline text-base md:text-lg group-hover:text-primary transition-colors line-clamp-3">
          <Link href={`/noticia/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="hidden md:block text-sm text-muted line-clamp-2">{article.subtitle ?? article.excerpt}</p>
        <Byline article={article} />
      </div>
    </article>
  );
}

/** Card com imagem de fundo e texto sobreposto */
export function ArticleOverlay({ article, priority = false, tall = false }: { article: Article; priority?: boolean; tall?: boolean }) {
  return (
    <article className={`group relative overflow-hidden rounded-[var(--radius)] bg-secondary ${tall ? "aspect-[4/5] md:aspect-[3/4]" : "aspect-[16/10]"} img-zoom`}>
      {article.cover_url && (
        <Image src={article.cover_url} alt={article.cover_alt ?? article.title} fill sizes="(max-width: 768px) 100vw, 50vw" priority={priority} className="object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-white space-y-1.5">
        {article.category && <span className="kicker !text-white/90 bg-primary px-2 py-0.5 inline-block">{article.category.name}</span>}
        <h3 className="headline text-lg md:text-xl">
          <Link href={`/noticia/${article.slug}`} className="hover:underline underline-offset-4">
            <span className="absolute inset-0" aria-hidden />
            {article.title}
          </Link>
        </h3>
        <Byline article={article} light />
      </div>
    </article>
  );
}

export function ArticleCompact({ article, index }: { article: Article; index?: number }) {
  return (
    <article className="group flex gap-3 py-3 border-b border-black/10 last:border-0">
      {index !== undefined && <span className="font-heading text-3xl font-black text-primary/30 leading-none w-8 shrink-0">{index + 1}</span>}
      <div className="min-w-0 space-y-1">
        <h4 className="headline text-[0.95rem] leading-snug group-hover:text-primary transition-colors line-clamp-3">
          <Link href={`/noticia/${article.slug}`}>{article.title}</Link>
        </h4>
        <div className="text-xs text-muted">{formatDate(article.published_at, "short")}</div>
      </div>
    </article>
  );
}
