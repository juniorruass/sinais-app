"use client";
import { useActionState } from "react";
import { saveSettings } from "@/app/admin/actions";

type State = { ok?: boolean; error?: string; t?: number } | null;

export default function SettingsForm({ children }: { children: React.ReactNode }) {
  const [state, act, pending] = useActionState<State, FormData>(async (_p, fd) => ({ ...(await saveSettings(fd)), t: Date.now() }), null);
  return (
    <form action={act}>
      {children}
      <div className="sticky bottom-4 flex flex-wrap items-center gap-3">
        <button disabled={pending} className="rounded-xl bg-gradient-to-r from-[#d3b993] to-[#9c8460] px-8 py-3 font-bold text-black shadow-xl shadow-black/50 transition hover:brightness-110 disabled:opacity-60">
          {pending ? "Salvando..." : "Salvar configurações"}
        </button>
        {!pending && state?.ok && <span key={state.t} className="rounded-lg bg-black/70 px-3 py-2 font-semibold text-emerald-400 text-sm">✓ Salvo com sucesso</span>}
        {!pending && state?.error && <span className="rounded-lg bg-black/70 px-3 py-2 font-semibold text-red-400 text-sm">⚠ {state.error}</span>}
      </div>
    </form>
  );
}
