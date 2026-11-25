import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

// /favicon.ico sempre aponta para o favicon definido no admin (ou para a logo).
export async function GET(req: Request) {
  const s = await getSettings();
  const target = s.favicon_url || "/logo.svg";
  return NextResponse.redirect(new URL(target, req.url), { status: 307, headers: { "Cache-Control": "public, max-age=300" } });
}
