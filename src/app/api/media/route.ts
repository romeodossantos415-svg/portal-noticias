import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/** Lista mídia para o seletor (apenas staff). */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const folder = url.searchParams.get("folder");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const per = 40;
  const supabase = await createClient();
  let query = supabase.from("media").select("*", { count: "exact" }).order("created_at", { ascending: false }).range((page - 1) * per, page * per - 1);
  if (q) query = query.or(`filename.ilike.%${q}%,alt.ilike.%${q}%,caption.ilike.%${q}%`);
  if (folder) query = folder === "root" ? query.is("folder_id", null) : query.eq("folder_id", folder);
  const [{ data, count }, { data: folders }] = await Promise.all([query, supabase.from("media_folders").select("*").order("name")]);
  return NextResponse.json({ items: data ?? [], total: count ?? 0, folders: folders ?? [] });
}
