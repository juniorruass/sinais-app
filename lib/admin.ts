import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Login do admin separado do site: ADMIN_EMAIL + ADMIN_PASSWORD (variáveis de ambiente), cookie assinado.
export const ADMIN_COOKIE = "admin_session";
const secret = () => process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "dev";
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");

export function makeSession() {
  const exp = String(Date.now() + 7 * 24 * 3600_000);
  return `${exp}.${sign(exp)}`;
}

export function checkCredentials(email: string, password: string) {
  const e = process.env.ADMIN_EMAIL, p = process.env.ADMIN_PASSWORD;
  if (!e || !p) return false;
  const eq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
  return eq(email.trim().toLowerCase(), e.trim().toLowerCase()) && eq(password, p);
}

export async function isAdminSession() {
  const v = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = sign(exp);
  return sig.length === good.length && timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}

export async function requireAdmin() {
  if (!(await isAdminSession())) redirect("/admin/login");
  return { id: "admin", email: process.env.ADMIN_EMAIL ?? "admin" };
}
