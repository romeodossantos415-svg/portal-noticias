import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { can, getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
const MAX = 15 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!(await can("media.upload"))) return NextResponse.json({ error: "Sem permissão para enviar arquivos" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  const folderId = (form.get("folder_id") as string) || null;
  const alt = (form.get("alt") as string) || null;
  const caption = (form.get("caption") as string) || null;
  const credit = (form.get("credit") as string) || null;
  if (!(file instanceof File)) return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Arquivo maior que 15 MB" }, { status: 400 });

  const supabase = await createClient();
  const buf = Buffer.from(await file.arrayBuffer());
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "arquivo";
  const stamp = Date.now().toString(36);
  const isImage = file.type.startsWith("image/") && file.type !== "image/svg+xml" && file.type !== "image/gif";

  let outBuf = buf;
  let outType = file.type;
  let ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  let width: number | null = null;
  let height: number | null = null;

  if (isImage) {
    // Otimização automática: redimensiona para no máximo 2000px e converte para WebP
    const img = sharp(buf, { failOn: "none" }).rotate();
    const meta = await img.metadata();
    const resized = meta.width && meta.width > 2000 ? img.resize({ width: 2000, withoutEnlargement: true }) : img;
    outBuf = await resized.webp({ quality: 82 }).toBuffer();
    const m2 = await sharp(outBuf).metadata();
    width = m2.width ?? null;
    height = m2.height ?? null;
    outType = "image/webp";
    ext = "webp";
  }

  const path = `${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${base}-${stamp}.${ext}`;
  const { error: upErr } = await supabase.storage.from("media").upload(path, outBuf, { contentType: outType, cacheControl: "31536000", upsert: false });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(path);

  const { data, error } = await supabase
    .from("media")
    .insert({ folder_id: folderId, storage_path: path, url: publicUrl, filename: file.name, mime_type: outType, size_bytes: outBuf.length, width, height, alt, caption, credit, uploaded_by: user.id })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
