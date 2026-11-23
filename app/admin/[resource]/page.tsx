import { notFound } from "next/navigation";
import FieldInput from "@/components/admin/FieldInput";
import { RESOURCES } from "@/lib/adminConfig";
import { createAdminClient } from "@/lib/supabase/server";
import { deleteRow, saveRow } from "../actions";

export default async function ResourcePage({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ cat?: string }> }) {
  const { resource } = await params;
  const { cat } = await searchParams;
  const r = RESOURCES[resource];
  if (!r) notFound();
  const pk = r.pk ?? "id";
  let q = createAdminClient().from(r.table).select("*");
  if (r.table === "games" && cat) q = q.eq("categoria", cat);
  const { data } = await q.order(r.fields.some((f) => f.name === "ordem") ? "ordem" : pk).order(pk);
  const rows = (data ?? []) as Record<string, unknown>[];

  const Form = ({ row }: { row?: Record<string, unknown> }) => (
    <form action={saveRow} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="_resource" value={resource} />
      {row && <input type="hidden" name="_id" value={String(row[pk])} />}
      {r.fields.map((f) => <FieldInput key={f.name} f={f} value={row?.[f.name]} />)}
      <div className="flex gap-2 sm:col-span-2">
        <button className="rounded-lg bg-[#d3b993] px-4 py-2 text-sm font-bold text-black">{row ? "Salvar" : `Adicionar ${r.singular}`}</button>
      </div>
    </form>
  );

  return (
    <div>
      <h1 className="mb-4 font-bold text-2xl">{r.title}</h1>
      {r.table === "games" && (
        <div className="mb-4 flex gap-2 text-sm">
          {["", "PG", "PP", "WG", "TADA"].map((c) => (
            <a key={c} href={c ? `?cat=${c}` : "?"} className={`rounded-full border px-3 py-1 ${((cat ?? "") === c) ? "border-[#d3b993] text-[#d3b993]" : "border-zinc-700 text-zinc-400"}`}>{c || "Todos"}</a>
          ))}
        </div>
      )}
      <details className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <summary className="cursor-pointer font-bold text-[#d3b993]">+ Novo {r.singular}</summary>
        <div className="mt-4"><Form /></div>
      </details>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <details key={String(row[pk])} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <summary className="cursor-pointer text-sm">{r.summary(row)}{row.ativo === false && <span className="ml-2 text-red-400">(inativo)</span>}</summary>
            <div className="mt-4"><Form row={row} />
              <form action={deleteRow} className="mt-3">
                <input type="hidden" name="_resource" value={resource} /><input type="hidden" name="_id" value={String(row[pk])} />
                <button className="rounded-lg border border-red-500/50 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10">Excluir</button>
              </form>
            </div>
          </details>
        ))}
        {rows.length === 0 && <p className="text-zinc-500">Nada cadastrado ainda.</p>}
      </div>
    </div>
  );
}
