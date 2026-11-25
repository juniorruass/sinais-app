"use client";
import { useActionState } from "react";
import { saveRow } from "@/app/admin/actions";

type State = { ok?: boolean; error?: string; t?: number } | null;
const btn = "rounded-xl bg-gradient-to-r from-[#d3b993] to-[#9c8460] px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-60";

// Formulário com aviso visível: "Salvando…", "✓ Salvo" ou o motivo do erro.
export default function SaveForm({ label, children }: { label: string; children: React.ReactNode }) {
  const [state, act, pending] = useActionState<State, FormData>(async (_prev, fd) => ({ ...(await saveRow(fd)), t: Date.now() }), null);
  return (
    <form action={act} className="grid gap-4 sm:grid-cols-2">
      {children}
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button disabled={pending} className={btn}>{pending ? "Salvando..." : label}</button>
        {!pending && state?.ok && <span key={state.t} className="font-semibold text-emerald-400 text-sm">✓ Salvo com sucesso</span>}
        {!pending && state?.error && <span className="font-semibold text-red-400 text-sm">⚠ {state.error}</span>}
      </div>
    </form>
  );
}
