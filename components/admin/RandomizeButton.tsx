"use client";
import { useActionState } from "react";
import { randomizeNow } from "@/app/admin/actions";

export default function RandomizeButton() {
  const [state, act, pending] = useActionState<{ n?: number; t?: number } | null, FormData>(async () => ({ ...(await randomizeNow()), t: Date.now() }), null);
  return (
    <form action={act} className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
      <button disabled={pending} className="rounded-xl bg-gradient-to-r from-[#d3b993] to-[#9c8460] px-5 py-2.5 font-bold text-black transition hover:brightness-110 disabled:opacity-60">
        {pending ? "Atualizando..." : "Atualizar sinais agora"}
      </button>
      {!pending && state?.n !== undefined && <span key={state.t} className="font-semibold text-emerald-400 text-sm">✓ {state.n} jogos atualizados às {new Date(state.t!).toLocaleTimeString("pt-BR")}</span>}
    </form>
  );
}
