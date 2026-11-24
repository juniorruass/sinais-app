"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, checkCredentials, makeSession } from "@/lib/admin";
import { clearFailures, lockedMinutes, registerFailure } from "@/lib/ratelimit";
import { getTotpSecret, verifyTotp } from "@/lib/totp";

export type LoginState = { error?: string; needCode?: boolean };

export async function adminLogin(_: LoginState, form: FormData): Promise<LoginState> {
  const lock = await lockedMinutes();
  if (lock) return { error: `Muitas tentativas. Tente novamente em ${lock} min.` };
  if (!checkCredentials(String(form.get("email") ?? ""), String(form.get("password") ?? ""))) {
    await registerFailure();
    return { error: "E-mail ou senha incorretos." };
  }
  const secret = await getTotpSecret();
  if (secret) {
    const code = String(form.get("code") ?? "");
    if (!code) return { needCode: true };
    if (!verifyTotp(secret, code)) {
      await registerFailure();
      return { needCode: true, error: "Código inválido. Confira o app autenticador." };
    }
  }
  await clearFailures();
  (await cookies()).set(ADMIN_COOKIE, makeSession(), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 24 * 3600 });
  redirect("/admin");
}

export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
