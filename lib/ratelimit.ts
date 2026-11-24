import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

// Limite de tentativas de login do admin (anti força-bruta), por IP. Estado num bucket privado do Storage.
const BUCKET = "private";
const FILE = "login-attempts.json";
const MAX = 5;            // tentativas erradas
const WINDOW = 15 * 60e3; // janela / bloqueio de 15 min

type Store = Record<string, { n: number; first: number; until?: number }>;

async function ip() {
  const h = await headers();
  const raw = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

async function load(): Promise<Store> {
  const { data } = await createAdminClient().storage.from(BUCKET).download(FILE);
  if (!data) return {};
  try { return JSON.parse(await data.text()); } catch { return {}; }
}

async function save(s: Store) {
  const sb = createAdminClient();
  await sb.storage.createBucket(BUCKET, { public: false }).catch(() => {});
  const now = Date.now();
  for (const k of Object.keys(s)) if ((s[k].until ?? s[k].first + WINDOW) < now) delete s[k];
  await sb.storage.from(BUCKET).upload(FILE, Buffer.from(JSON.stringify(s)), { contentType: "application/json", upsert: true });
}

/** Retorna minutos restantes de bloqueio (0 = liberado). */
export async function lockedMinutes() {
  const s = await load(), e = s[await ip()];
  if (e?.until && e.until > Date.now()) return Math.ceil((e.until - Date.now()) / 60000);
  return 0;
}

export async function registerFailure() {
  const s = await load(), k = await ip(), now = Date.now();
  const e = s[k] && now - s[k].first < WINDOW ? s[k] : { n: 0, first: now };
  e.n++;
  if (e.n >= MAX) e.until = now + WINDOW;
  s[k] = e;
  await save(s);
}

export async function clearFailures() {
  const s = await load(), k = await ip();
  if (s[k]) { delete s[k]; await save(s); }
}
