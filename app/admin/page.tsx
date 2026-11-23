import Link from "next/link";
import { RESOURCES } from "@/lib/adminConfig";
import { createAdminClient } from "@/lib/supabase/server";
import { randomizeNow } from "./actions";

export default async function Dashboard() {
  const sb = createAdminClient();
  const counts = await Promise.all(
    Object.entries(RESOURCES).map(async ([k, r]) => {
      const { count } = await sb.from(r.table).select("*", { count: "exact", head: true });
      return { k, title: r.title, count: count ?? 0 };
    }),
  );
  const { count: users } = await sb.from("profiles").select("*", { count: "exact", head: true });
  return (
    <div>
      <h1 className="mb-6 font-bold text-2xl">Painel</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {counts.map((c) => (
          <Link key={c.k} href={`/admin/${c.k}`} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-[#d3b993]">
            <div className="text-3xl font-bold text-[#d3b993]">{c.count}</div><div className="text-sm text-zinc-400">{c.title}</div>
          </Link>
        ))}
        <Link href="/admin/usuarios" className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-[#d3b993]">
          <div className="text-3xl font-bold text-[#d3b993]">{users ?? 0}</div><div className="text-sm text-zinc-400">Usuários</div>
        </Link>
      </div>
      <form action={randomizeNow} className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="mb-3 text-sm text-zinc-300">Forçar nova rodada de sinais agora (embaralha as porcentagens dos jogos que não estão “fixos”).</p>
        <button className="rounded-lg bg-[#d3b993] px-4 py-2 font-bold text-black">Atualizar sinais agora</button>
      </form>
    </div>
  );
}
