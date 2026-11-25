"use client";
import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp } from "@/app/actions";

const input = "w-full rounded-full bg-field px-5 py-3 font-semibold text-field-text placeholder:text-field-text/50 focus-visible:outline-0";

export default function AuthForm({ mode }: { mode: "login" | "cadastro" }) {
  const [state, action, pending] = useActionState(mode === "login" ? signIn : signUp, undefined);
  const reg = mode === "cadastro";
  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h1 className="mb-6 text-center font-bold text-3xl uppercase text-primary">{reg ? "Cadastre-se" : "Entrar"}</h1>
      <form action={action} className="flex flex-col gap-4">
        {reg && <label className="flex flex-col gap-1 text-sm font-semibold">Nome Completo<input name="name" required placeholder="Seu nome" className={input} /></label>}
        <label className="flex flex-col gap-1 text-sm font-semibold">Telefone (DDD + número)<input name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" required minLength={10} maxLength={16} placeholder="11999998888" className={input} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Senha<input name="password" type="password" required minLength={reg ? 8 : 1} placeholder="••••••••" className={input} /></label>
        {reg && <label className="flex flex-col gap-1 text-sm font-semibold">Confirmar Senha<input name="confirm" type="password" required minLength={8} placeholder="••••••" className={input} /></label>}
        {state?.error && <p className="rounded-xl bg-red-500/20 px-4 py-2 text-center text-sm text-red-200">{state.error}</p>}
        <button disabled={pending} className="mt-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end py-3 font-black text-btn uppercase transition-all hover:scale-[1.02] disabled:opacity-60">
          {pending ? "Aguarde..." : reg ? "Finalizar Cadastro" : "Entrar"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/70">
        {reg ? "Já tem uma conta? " : "Ainda não tem conta? "}
        <Link href={reg ? "/login" : "/cadastro"} className="font-bold text-primary">{reg ? "Fazer login" : "Cadastre-se"}</Link>
      </p>
    </div>
  );
}
