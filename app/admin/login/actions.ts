"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, checkCredentials, makeSession } from "@/lib/admin";

export async function adminLogin(_: { error?: string }, form: FormData): Promise<{ error?: string }> {
  if (!checkCredentials(String(form.get("email") ?? ""), String(form.get("password") ?? ""))) return { error: "E-mail ou senha incorretos." };
  (await cookies()).set(ADMIN_COOKIE, makeSession(), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 7 * 24 * 3600 });
  redirect("/admin");
}

export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
