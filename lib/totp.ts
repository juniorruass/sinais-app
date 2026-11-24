import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function newSecret() {
  const b = randomBytes(20);
  let bits = "", out = "";
  for (const x of b) bits += x.toString(2).padStart(8, "0");
  for (let i = 0; i + 5 <= bits.length; i += 5) out += ALPHA[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}

function decode(s: string) {
  let bits = "";
  for (const c of s.replace(/=+$/, "").toUpperCase()) bits += ALPHA.indexOf(c).toString(2).padStart(5, "0");
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function code(secret: string, counter: number) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", decode(secret)).update(buf).digest();
  const o = h[h.length - 1] & 0xf;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, "0");
}

export function verifyTotp(secret: string, input: string) {
  const c = input.replace(/\s/g, "");
  if (!/^\d{6}$/.test(c)) return false;
  const t = Math.floor(Date.now() / 30000);
  for (const d of [-1, 0, 1]) {
    const g = code(secret, t + d);
    if (timingSafeEqual(Buffer.from(g), Buffer.from(c))) return true;
  }
  return false;
}

export const otpauthUrl = (secret: string, account: string, issuer = "Painel Admin") =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

// O segredo fica num bucket PRIVADO do Storage (não legível pelo público).
const BUCKET = "private";
const FILE = "admin-totp.json";

export async function getTotpSecret(): Promise<string | null> {
  const sb = createAdminClient();
  const { data, error } = await sb.storage.from(BUCKET).download(FILE);
  if (error || !data) return null;
  try { return JSON.parse(await data.text()).secret ?? null; } catch { return null; }
}

export async function setTotpSecret(secret: string | null) {
  const sb = createAdminClient();
  if (secret === null) { await sb.storage.from(BUCKET).remove([FILE]); return; }
  await sb.storage.createBucket(BUCKET, { public: false }).catch(() => {});
  const { error } = await sb.storage.from(BUCKET).upload(FILE, Buffer.from(JSON.stringify({ secret })), { contentType: "application/json", upsert: true });
  if (error) throw new Error(error.message);
}
