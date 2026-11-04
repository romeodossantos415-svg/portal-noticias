import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container-site py-24 text-center space-y-4">
      <p className="kicker">Erro 404</p>
      <h1 className="headline text-4xl">Página não encontrada</h1>
      <p className="text-muted">O conteúdo que você procura não existe ou foi removido.</p>
      <Link href="/" className="inline-block bg-secondary text-white px-5 py-2.5 rounded-[var(--radius)] font-semibold">Voltar à página inicial</Link>
    </div>
  );
}
