import { Search } from "lucide-react";

export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/busca" className="relative" role="search">
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Buscar notícias"
        aria-label="Buscar notícias"
        className="w-full border border-black/15 rounded-full pl-4 pr-10 py-2 text-sm bg-surface focus:bg-bg focus:outline-none focus:border-primary transition"
      />
      <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-primary" aria-label="Buscar">
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
