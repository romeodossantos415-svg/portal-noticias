import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase.from("ads").select("link_url").eq("id", id).maybeSingle();
  if (!data?.link_url) return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL));
  await supabase.rpc("increment_ad_click", { ad_id: id });
  return NextResponse.redirect(data.link_url);
}
