"use client";
import { useState } from "react";
import { FaArrowDown, FaArrowUp, FaPlus, FaTrash } from "react-icons/fa6";
import { ROW_SCHEMAS } from "@/lib/rowSchemas";


const inp = "w-full rounded-lg border border-zinc-700/80 bg-zinc-950/60 px-3 py-2 text-sm text-white outline-none focus:border-[#d3b993] focus:ring-2 focus:ring-[#d3b993]/20";
const clean = (v: string) => v.replace(/[|\r\n]+/g, " ").trim();

export default function RowsEditor({ name, slug, value }: { name: string; slug: string; value: string }) {
  const sc = ROW_SCHEMAS[slug];
  const n = sc.cols.length;
  const [rows, setRows] = useState<string[][]>(() => {
    const r = value.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const p = l.split("|").map((x) => x.trim()); while (p.length < n) p.push(""); return p.slice(0, n); });
    return r;
  });
  const [up, setUp] = useState<string | null>(null);
  const set = (i: number, c: number, v: string) => setRows((rs) => rs.map((r, k) => (k === i ? r.map((x, j) => (j === c ? v : x)) : r)));
  const move = (i: number, d: number) => setRows((rs) => { const a = [...rs], j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
  async function upload(i: number, c: number, f: File) {
    setUp(`${i}-${c}`);
    const fd = new FormData(); fd.append("file", f);
    try { const j = await (await fetch("/admin/upload", { method: "POST", body: fd })).json(); if (j.url) set(i, c, j.url); else alert(j.error ?? "Falha no upload"); } catch { alert("Falha no upload"); }
    setUp(null);
  }
  const serialized = rows.filter((r) => r.some((x) => x.trim())).map((r) => r.map(clean).join(" | ")).join("\n");

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <input type="hidden" name={name} value={serialized} />
      <span className="font-semibold text-[11px] text-zinc-400 uppercase tracking-wider">Itens da página</span>
      {sc.help && <span className="text-xs text-zinc-500">{sc.help}</span>}
      {rows.length === 0 && <div className="rounded-xl border border-zinc-800 border-dashed p-4 text-center text-sm text-zinc-500">Nenhum item. Clique em “{sc.add}”.</div>}
      {rows.map((r, i) => (
        <div key={i} className="flex items-start gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            {sc.cols.map((c, j) => (
              <label key={j} className={`flex flex-col gap-1 ${c.kind === "long" || c.kind === "image" ? "sm:col-span-2" : ""}`}>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{c.label}</span>
                {c.kind === "long" ? <textarea rows={2} value={r[j]} onChange={(e) => set(i, j, e.target.value)} className={inp} />
                  : c.kind === "status" ? <select value={r[j] || "online"} onChange={(e) => set(i, j, e.target.value)} className={inp}><option>online</option><option>offline</option></select>
                  : c.kind === "image" ? (
                    <span className="flex items-center gap-2">
                      {r[j] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={r[j]} alt="" className="h-10 w-10 rounded object-cover" />}
                      <input value={r[j]} onChange={(e) => set(i, j, e.target.value)} placeholder="URL da imagem" className={inp} />
                      <span className="shrink-0 cursor-pointer rounded-lg bg-[#d3b993] px-3 py-2 font-bold text-black text-xs">
                        {up === `${i}-${j}` ? "Enviando..." : "Enviar"}
                        <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(i, j, f); e.target.value = ""; }} />
                      </span>
                    </span>
                  ) : <input value={r[j]} onChange={(e) => set(i, j, e.target.value)} placeholder={c.placeholder} className={inp} />}
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <button type="button" onClick={() => move(i, -1)} className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800" title="Subir"><FaArrowUp size={12} /></button>
            <button type="button" onClick={() => move(i, 1)} className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800" title="Descer"><FaArrowDown size={12} /></button>
            <button type="button" onClick={() => setRows((rs) => rs.filter((_, k) => k !== i))} className="rounded-md p-2 text-red-400 hover:bg-red-500/10" title="Remover"><FaTrash size={12} /></button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setRows((rs) => [...rs, Array(n).fill("")])} className="flex w-fit items-center gap-2 rounded-lg border border-[#d3b993]/50 px-4 py-2 font-semibold text-[#d3b993] text-sm hover:bg-[#d3b993]/10"><FaPlus size={11} />{sc.add}</button>
    </div>
  );
}
