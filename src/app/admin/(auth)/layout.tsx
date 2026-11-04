import { getSettings } from "@/lib/data";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          {s.identity?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.identity.logo_url} alt={s.identity.name} className="h-10 mx-auto object-contain" />
          ) : (
            <span className="font-heading text-3xl font-black">{s.identity?.name ?? "Portal"}</span>
          )}
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Painel administrativo</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">{children}</div>
      </div>
    </div>
  );
}
