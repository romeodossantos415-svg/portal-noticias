import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { id } = await req.json().catch(() => ({}));
  if (!id || typeof id !== "string") return NextResponse.json({ ok: false }, { status: 400 });
  const supabase = createPublicClient();
  await supabase.rpc("increment_article_view", { aid: id });
  return NextResponse.json({ ok: true });
}
