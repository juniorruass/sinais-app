import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";

const MAX = 6 * 1024 * 1024;
// tipo → [extensão, assinatura (magic bytes)]. SVG é proibido (pode carregar script).
const TYPES: Record<string, { ext: string; ok: (b: Buffer) => boolean }> = {
  "image/png": { ext: "png", ok: (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) },
  "image/jpeg": { ext: "jpg", ok: (b) => b[0] === 0xff && b[1] === 0xd8 },
  "image/webp": { ext: "webp", ok: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  "image/gif": { ext: "gif", ok: (b) => b.subarray(0, 3).toString() === "GIF" },
  "image/avif": { ext: "avif", ok: (b) => b.subarray(4, 12).toString().startsWith("ftyp") },
};

export async function POST(req: Request) {
  // Atrás do proxy (Apache) o Host interno é 127.0.0.1; o domínio real vem em x-forwarded-host.
  const origin = req.headers.get("origin");
  const hosts = [req.headers.get("host"), req.headers.get("x-forwarded-host")?.split(",")[0].trim()].filter(Boolean);
  let originHost = "";
  try { originHost = origin ? new URL(origin).host : ""; } catch {}
  if (origin && !hosts.includes(originHost)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!(await isAdminSession())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "sem arquivo" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Imagem maior que 6 MB." }, { status: 413 });
  const t = TYPES[file.type];
  const buf = Buffer.from(await file.arrayBuffer());
  if (!t || !t.ok(buf)) return NextResponse.json({ error: "Formato não permitido. Use PNG, JPG, WEBP, GIF ou AVIF." }, { status: 415 });
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${t.ext}`;
  const sb = createAdminClient();
  const { error } = await sb.storage.from("media").upload(path, buf, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: "Falha ao salvar a imagem." }, { status: 500 });
  return NextResponse.json({ url: sb.storage.from("media").getPublicUrl(path).data.publicUrl });
}
