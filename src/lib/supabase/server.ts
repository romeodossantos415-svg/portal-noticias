import { createServerClient } from "@supabase/ssr";
import { createClient as createBare } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Cliente com sessão do usuário (cookies). Respeita RLS. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // chamado a partir de Server Component: o proxy renova a sessão
        }
      },
    },
  });
}

/** Cliente anônimo sem cookies — para páginas públicas cacheáveis. */
export function createPublicClient() {
  return createBare(URL, ANON, { auth: { persistSession: false } });
}

/** Cliente administrativo (service role). Somente no servidor, nunca exposto. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  return createBare(URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
