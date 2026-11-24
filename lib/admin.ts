import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Login do admin separado do site: ADMIN_EMAIL + ADMIN_PASSWORD (variáveis de ambiente), cookie assinado.
// "__Host-" obriga Secure, path=/ e sem Domain (não pode ser sobrescrito por subdomínio).
export const ADMIN_COOKIE = "__Host-admin_session";
const TTL = 24 * 3600_000;
const secret = () => {
  const s = process.env.ADMIN_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("ADMIN_SECRET não configurado");
  return s || "dev-only";
};
export const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");
const sha = (v: string) => createHash("sha256").update(v).digest();

export function makeSession() {
  const exp = String(Date.now() + TTL);
  return `${exp}.${sign("sess:" + exp)}`;
}

export function checkCredentials(email: string, password: string) {
  const e = process.env.ADMIN_EMAIL, p = process.env.ADMIN_PASSWORD;
  if (!e || !p) return false;
  // compara hashes (tempo constante, sem vazar tamanho)
  const a = timingSafeEqual(sha(email.trim().toLowerCase()), sha(e.trim().toLowerCase()));
  const b = timingSafeEqual(sha(password), sha(p));
  return a && b;
}

export async function isAdminSession() {
  const v = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig || !(Number(exp) > Date.now())) return false;
  const good = sign("sess:" + exp);
  return sig.length === good.length && timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}

export async function requireAdmin() {
  if (!(await isAdminSession())) redirect("/admin/login");
  return { id: "admin", email: process.env.ADMIN_EMAIL ?? "admin" };
}
