"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(gameId: number) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("not-auth");
  const { data } = await sb.from("favorites").select("game_id").eq("user_id", user.id).eq("game_id", gameId).maybeSingle();
  if (data) await sb.from("favorites").delete().eq("user_id", user.id).eq("game_id", gameId);
  else await sb.from("favorites").insert({ user_id: user.id, game_id: gameId });
}

export type AuthState = { error?: string } | undefined;

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  });
  if (error) return { error: "E-mail ou senha inválidos." };
  redirect("/");
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!name || !email) return { error: "Preencha todos os campos." };
  if (password.length < 6) return { error: "A senha precisa ter pelo menos 6 caracteres." };
  if (password !== String(form.get("confirm") ?? "")) return { error: "As senhas não conferem." };
  const sb = await createClient();
  const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
  if (error) return { error: error.message.includes("registered") ? "Este e-mail já está cadastrado." : "Não foi possível cadastrar. Tente novamente." };
  if (!data.session) return { error: "Cadastro criado! Confirme seu e-mail para entrar." };
  redirect("/");
}

export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/");
}
