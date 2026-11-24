"use client";
import { useActionState } from "react";
import { adminLogin } from "./actions";

export default function AdminLoginForm() {
  const [st, action, pending] = useActionState(adminLogin, {} as { error?: string });
  return (
    <form action={action} className="fixed inset-0 z-[500] flex items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100">
        <h1 className="mb-4 font-bold text-[#d3b993] text-xl">Painel administrativo</h1>
        <input name="email" type="email" placeholder="E-mail" required className="mb-3 w-full rounded-lg bg-zinc-800 px-3 py-2.5 text-sm" />
        <input name="password" type="password" placeholder="Senha" required className="mb-3 w-full rounded-lg bg-zinc-800 px-3 py-2.5 text-sm" />
        {st.error && <p className="mb-3 text-red-400 text-sm">{st.error}</p>}
        <button disabled={pending} className="w-full rounded-lg bg-[#d3b993] py-2.5 font-bold text-black text-sm">{pending ? "Entrando..." : "Entrar"}</button>
      </div>
    </form>
  );
}
