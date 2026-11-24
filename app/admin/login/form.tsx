"use client";
import { useActionState, useState } from "react";
import { adminLogin, type LoginState } from "./actions";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [st, action, pending] = useActionState(adminLogin, {} as LoginState);
  return (
    <form action={action} className="fixed inset-0 z-[500] flex items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100">
        <h1 className="mb-4 font-bold text-[#d3b993] text-xl">Painel administrativo</h1>
        <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required className="mb-3 w-full rounded-lg bg-zinc-800 px-3 py-2.5 text-sm" />
        <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required className="mb-3 w-full rounded-lg bg-zinc-800 px-3 py-2.5 text-sm" />
        {st.needCode && (
          <>
            <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} placeholder="Código de 6 dígitos do autenticador" autoFocus
              className="mb-3 w-full rounded-lg bg-zinc-800 px-3 py-2.5 text-center text-sm tracking-widest" />
          </>
        )}
        {st.error && <p className="mb-3 text-red-400 text-sm">{st.error}</p>}
        <button disabled={pending} className="w-full rounded-lg bg-[#d3b993] py-2.5 font-bold text-black text-sm">{pending ? "Entrando..." : st.needCode ? "Confirmar código" : "Entrar"}</button>
      </div>
    </form>
  );
}
