import Link from "next/link";
import { FaBolt } from "react-icons/fa6";
import { RESOURCES } from "@/lib/adminConfig";
import { createAdminClient } from "@/lib/supabase/server";
import { randomizeNow } from "@/app/admin/actions";

export default async function Dashboard() {
  const sb = createAdminClient();
  const counts = await Promise.all(
    Object.entries(RESOURCES).map(async ([k, r]) => {
      const { count } = await sb.from(r.table).select("*", { count: "exact", head: true });
      return { k, title: r.title, count: count ?? 0 };
    }),
  );
  const { count: users } = await sb.from("profiles").select("*", { count: "exact", head: true });
  const cards = [...counts.map((c) => ({ href: `/admin/${c.k}`, title: c.title, count: c.count })), { href: "/admin/usuarios", title: "Usuários", count: users ?? 0 }];
  return (
    <div>
      <h1 className="font-bold text-3xl">Painel</h1>
      <p className="mt-1 mb-8 text-zinc-400 text-sm">Visão geral do site. Clique em um card para editar.</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:-translate-y-0.5 hover:border-[#d3b993]/60 hover:bg-zinc-900">
            <div className="bg-gradient-to-r from-[#d3b993] to-[#9c8460] bg-clip-text font-black text-4xl text-transparent">{c.count}</div>
            <div className="mt-1 text-sm text-zinc-400 group-hover:text-zinc-200">{c.title}</div>
          </Link>
        ))}
      </div>
      <form action={randomizeNow} className="mt-8 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-bold"><FaBolt className="text-[#d3b993]" />Sinais</div>
          <p className="mt-1 text-sm text-zinc-400">Força uma nova rodada agora. Embaralha as porcentagens dos jogos que não estão “fixos”.</p>
        </div>
        <button className="shrink-0 rounded-xl bg-gradient-to-r from-[#d3b993] to-[#9c8460] px-5 py-2.5 font-bold text-black transition hover:brightness-110">Atualizar sinais agora</button>
      </form>
    </div>
  );
}
