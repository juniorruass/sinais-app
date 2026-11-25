import { notFound } from "next/navigation";
import FieldInput from "@/components/admin/FieldInput";
import { RESOURCES } from "@/lib/adminConfig";
import { createAdminClient } from "@/lib/supabase/server";
import SaveForm from "@/components/admin/SaveForm";
import RowsEditor from "@/components/admin/RowsEditor";
import { ROW_SCHEMAS } from "@/lib/rowSchemas";
import { deleteRow } from "@/app/admin/actions";

const PER = 40;
const btn = "rounded-xl bg-gradient-to-r from-[#d3b993] to-[#9c8460] px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110";

export default async function ResourcePage({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ cat?: string; q?: string; p?: string }> }) {
  const { resource } = await params;
  const { cat, q: term, p } = await searchParams;
  const r = RESOURCES[resource];
  if (!r) notFound();
  const pk = r.pk ?? "id";
  const page = Math.max(1, Number(p) || 1);
  let q = createAdminClient().from(r.table).select("*", { count: "exact" });
  if (r.table === "games" && cat) q = q.eq("categoria", cat);
  const textCol = r.fields.find((f) => f.name === "nome" || f.name === "label")?.name;
  if (term && textCol) q = q.ilike(textCol, `%${term}%`);
  const { data, count } = await q.order(r.fields.some((f) => f.name === "ordem") ? "ordem" : pk).order(pk).range((page - 1) * PER, page * PER - 1);
  const rows = (data ?? []) as Record<string, unknown>[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PER));
  const qs = (o: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    const m = { cat, q: term, ...o } as Record<string, string | number | undefined>;
    for (const [k, v] of Object.entries(m)) if (v) u.set(k, String(v));
    return `?${u}`;
  };

  const Form = ({ row }: { row?: Record<string, unknown> }) => (
    <SaveForm label={row ? "Salvar alterações" : `Adicionar ${r.singular}`}>
      <input type="hidden" name="_resource" value={resource} />
      {row && <input type="hidden" name="_id" value={String(row[pk])} />}
      {r.fields.map((f) =>
        r.table === "pages" && f.name === "content" && row && ROW_SCHEMAS[String(row.slug)]
          ? <RowsEditor key={f.name} name={f.name} slug={String(row.slug)} value={String(row.content ?? "")} />
          : <FieldInput key={f.name} f={f} value={row?.[f.name]} />)}
    </SaveForm>
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-bold text-3xl">{r.title}</h1><p className="text-sm text-zinc-400">{count ?? 0} registro(s)</p></div>
        {textCol && (
          <form className="flex gap-2">
            {cat && <input type="hidden" name="cat" value={cat} />}
            <input name="q" defaultValue={term} placeholder="Buscar pelo nome..." className="w-56 rounded-xl border border-zinc-700 bg-zinc-950/60 px-3.5 py-2 text-sm outline-none focus:border-[#d3b993]" />
            <button className="rounded-xl border border-zinc-700 px-4 text-sm hover:border-[#d3b993]">Buscar</button>
          </form>
        )}
      </div>
      {r.table === "games" && (
        <div className="mb-5 flex flex-wrap gap-2 text-sm">
          {["", "PG", "PP", "WG", "TADA"].map((c) => (
            <a key={c} href={qs({ cat: c || undefined, p: undefined })} className={`rounded-full border px-4 py-1.5 transition ${((cat ?? "") === c) ? "border-[#d3b993] bg-[#d3b993]/10 text-[#d3b993]" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>{c || "Todos"}</a>
          ))}
        </div>
      )}
      <details className="mb-6 overflow-hidden rounded-2xl border border-[#d3b993]/30 bg-[#d3b993]/5">
        <summary className="cursor-pointer select-none px-5 py-4 font-bold text-[#d3b993]">+ Novo {r.singular}</summary>
        <div className="border-zinc-800 border-t p-5"><Form /></div>
      </details>
      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const thumb = (row.image_url || row.icon_url) as string | undefined;
          return (
            <details key={String(row[pk])} className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition open:border-zinc-700">
              <summary className="flex cursor-pointer select-none items-center gap-3 px-4 py-3 text-sm hover:bg-white/[0.03]">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-lg bg-zinc-800 object-cover" />
                ) : <span className="h-11 w-11 shrink-0 rounded-lg bg-zinc-800" />}
                <span className="flex-1 truncate">{r.summary(row)}</span>
                {row.ativo === false && <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-red-300 text-xs">inativo</span>}
                <span className="text-zinc-500 transition group-open:rotate-180">▾</span>
              </summary>
              <div className="border-zinc-800 border-t p-5">
                <Form row={row} />
                <form action={deleteRow} className="mt-4 border-zinc-800 border-t pt-4">
                  <input type="hidden" name="_resource" value={resource} /><input type="hidden" name="_id" value={String(row[pk])} />
                  <button className="rounded-xl border border-red-500/40 px-4 py-2 text-red-300 text-xs transition hover:bg-red-500/10">Excluir</button>
                </form>
              </div>
            </details>
          );
        })}
        {rows.length === 0 && <p className="rounded-2xl border border-zinc-800 p-8 text-center text-zinc-500">Nada encontrado.</p>}
      </div>
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 && <a href={qs({ p: page - 1 })} className="rounded-xl border border-zinc-700 px-4 py-2 hover:border-[#d3b993]">← Anterior</a>}
          <span className="text-zinc-400">Página {page} de {pages}</span>
          {page < pages && <a href={qs({ p: page + 1 })} className="rounded-xl border border-zinc-700 px-4 py-2 hover:border-[#d3b993]">Próxima →</a>}
        </div>
      )}
    </div>
  );
}
