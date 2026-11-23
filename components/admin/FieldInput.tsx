"use client";
import { useState } from "react";
import type { Field } from "@/lib/adminConfig";

const base = "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-[#d3b993]";

export default function FieldInput({ f, value }: { f: Field; value: unknown }) {
  const [img, setImg] = useState(String(value ?? ""));
  const [busy, setBusy] = useState(false);
  const wrap = (child: React.ReactNode) => (
    <label className={`flex flex-col gap-1 text-xs font-semibold text-zinc-300 ${f.wide ? "sm:col-span-2" : ""}`}>
      {f.label}{child}{f.hint && <span className="font-normal text-zinc-500">{f.hint}</span>}
    </label>
  );
  if (f.type === "bool")
    return <label className="flex items-center gap-2 text-sm text-zinc-200"><input type="checkbox" name={f.name} defaultChecked={value === undefined ? true : !!value} className="h-4 w-4" />{f.label}</label>;
  if (f.type === "textarea") return wrap(<textarea name={f.name} defaultValue={String(value ?? "")} rows={5} className={base} />);
  if (f.type === "list") return wrap(<textarea name={f.name} defaultValue={Array.isArray(value) ? value.join("\n") : ""} rows={6} className={`${base} font-mono`} />);
  if (f.type === "select") return wrap(<select name={f.name} defaultValue={String(value ?? f.options?.[0])} className={base}>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>);
  if (f.type === "number") return wrap(<input type="number" name={f.name} defaultValue={value === undefined ? 0 : Number(value)} className={base} />);
  if (f.type === "color")
    return wrap(<span className="flex gap-2"><input type="color" value={img || "#000000"} onChange={(e) => setImg(e.target.value)} className="h-9 w-12 rounded" /><input name={f.name} value={img} onChange={(e) => setImg(e.target.value)} className={base} /></span>);
  if (f.type === "image") {
    async function up(file: File) {
      setBusy(true);
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/admin/upload", { method: "POST", body: fd });
      const j = await r.json(); setBusy(false);
      if (j.url) setImg(j.url); else alert(j.error ?? "Falha no upload");
    }
    return wrap(
      <span className="flex items-center gap-3">
        {img ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt="" className="h-14 w-14 rounded-lg bg-zinc-800 object-cover" /> : <span className="h-14 w-14 rounded-lg bg-zinc-800" />}
        <span className="flex flex-1 flex-col gap-1">
          <input name={f.name} value={img} onChange={(e) => setImg(e.target.value)} placeholder="URL da imagem" className={base} />
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && up(e.target.files[0])} className="text-xs text-zinc-400" />
          {busy && <span className="text-[#d3b993]">Enviando...</span>}
        </span>
      </span>,
    );
  }
  return wrap(<input name={f.name} defaultValue={String(value ?? "")} className={base} />);
}
