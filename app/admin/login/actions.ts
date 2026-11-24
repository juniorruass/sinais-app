"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, checkCredentials, makeSession } from "@/lib/admin";
import { getTotpSecret, verifyTotp } from "@/lib/totp";

export type LoginState = { error?: string; needCode?: boolean };

export async function adminLogin(_: LoginState, form: FormData): Promise<LoginState> {
  if (!checkCredentials(String(form.get("email") ?? ""), String(form.get("password") ?? ""))) return { error: "E-mail ou senha incorretos." };
  const secret = await getTotpSecret();
  if (secret) {
    const code = String(form.get("code") ?? "");
    if (!code) return { needCode: true };
    if (!verifyTotp(secret, code)) return { needCode: true, error: "Código inválido. Confira o app autenticador." };
  }
  (await cookies()).set(ADMIN_COOKIE, makeSession(), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 7 * 24 * 3600 });
  redirect("/admin");
}

export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
