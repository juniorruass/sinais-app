"use server";
import { redirect } from "next/navigation";
import { requireAdmin, sign } from "@/lib/admin";
import { getTotpSecret, setTotpSecret, verifyTotp } from "@/lib/totp";

export async function enableTotp(form: FormData) {
  await requireAdmin();
  const secret = String(form.get("secret"));
  if (sign("totp:" + secret) !== String(form.get("sig"))) redirect("/admin/seguranca?erro=1");
  if (!verifyTotp(secret, String(form.get("code") ?? ""))) redirect("/admin/seguranca?erro=1");
  await setTotpSecret(secret);
  redirect("/admin/seguranca?ok=1");
}

export async function disableTotp(form: FormData) {
  await requireAdmin();
  const secret = await getTotpSecret();
  if (secret && !verifyTotp(secret, String(form.get("code") ?? ""))) redirect("/admin/seguranca?erro=2");
  await setTotpSecret(null);
  redirect("/admin/seguranca");
}
