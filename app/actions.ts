"use server";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function toggleFavorite(gameId: number) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("not-auth");
  const { data } = await sb.from("favorites").select("game_id").eq("user_id", user.id).eq("game_id", gameId).maybeSingle();
  if (data) await sb.from("favorites").delete().eq("user_id", user.id).eq("game_id", gameId);
  else await sb.from("favorites").insert({ user_id: user.id, game_id: gameId });
}

export type AuthState = { error?: string } | undefined;

// Login por telefone (DDD + número). Internamente vira um e-mail fictício, o usuário nunca vê isso.
function phoneToEmail(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("55") && d.length > 11) d = d.slice(2);
  if (!/^[1-9][1-9]9?\d{8}$/.test(d)) return null; // DDD (2) + 8 ou 9 dígitos
  return { digits: d, email: `55${d}@tel.sinais.app` };
}

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const ph = phoneToEmail(String(form.get("phone") ?? ""));
  if (!ph) return { error: "Digite o telefone com DDD. Ex: 11999998888" };
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email: ph.email, password: String(form.get("password") ?? "") });
  if (error) return { error: "Telefone ou senha inválidos." };
  redirect("/");
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const name = String(form.get("name") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const ph = phoneToEmail(String(form.get("phone") ?? ""));
  if (!name) return { error: "Preencha todos os campos." };
  if (!ph) return { error: "Digite o telefone com DDD. Ex: 11999998888" };
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  if (password !== String(form.get("confirm") ?? "")) return { error: "As senhas não conferem." };
  const { error: ce } = await createAdminClient().auth.admin.createUser({
    email: ph.email, password, email_confirm: true, user_metadata: { name, phone: ph.digits },
  });
  if (ce) return { error: /already|registered/i.test(ce.message) ? "Este telefone já está cadastrado." : "Não foi possível cadastrar. Tente novamente." };
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email: ph.email, password });
  if (error) return { error: "Cadastro criado, mas não foi possível entrar. Tente fazer login." };
  redirect("/");
}

export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/");
}
