"use client";
import { useRef, useState } from "react";
import { FaCloudArrowUp, FaImage } from "react-icons/fa6";
import type { Field } from "@/lib/adminConfig";

const base = "w-full rounded-xl border border-zinc-700/80 bg-zinc-950/60 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#d3b993] focus:ring-2 focus:ring-[#d3b993]/20";

export default function FieldInput({ f, value }: { f: Field; value: unknown }) {
  const [img, setImg] = useState(String(value ?? ""));
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [drag, setDrag] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const wrap = (child: React.ReactNode) => (
    <label className={`flex flex-col gap-1.5 ${f.wide ? "sm:col-span-2" : ""}`}>
      <span className="font-semibold text-[11px] text-zinc-400 uppercase tracking-wider">{f.label}</span>{child}
      {f.hint && <span className="text-xs text-zinc-500">{f.hint}</span>}
    </label>
  );
  if (f.type === "bool")
    return (
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3.5 py-2.5 text-sm text-zinc-200">
        <input type="checkbox" name={f.name} defaultChecked={value === undefined ? true : !!value} className="h-4 w-4 accent-[#d3b993]" />{f.label}
      </label>
    );
  if (f.type === "textarea") return wrap(<textarea name={f.name} defaultValue={String(value ?? "")} rows={f.name === "content" ? 12 : 5} className={base} />);
  if (f.type === "list") return wrap(<textarea name={f.name} defaultValue={Array.isArray(value) ? value.join("\n") : ""} rows={6} className={`${base} font-mono`} />);
  if (f.type === "select") return wrap(<select name={f.name} defaultValue={String(value ?? f.options?.[0])} className={base}>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>);
  if (f.type === "number") return wrap(<input type="number" name={f.name} defaultValue={value === undefined ? (f.name === "peso" ? 1 : 0) : Number(value)} className={base} />);
  if (f.type === "color")
    return wrap(<span className="flex gap-2"><input type="color" value={img || "#000000"} onChange={(e) => setImg(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg bg-transparent" /><input name={f.name} value={img} onChange={(e) => setImg(e.target.value)} className={base} /></span>);
  if (f.type === "image") {
    // Reduz a imagem no próprio navegador (máx. 1920px, WebP) — envia bem menos dados.
    async function shrink(fl: File): Promise<File> {
      if (fl.type === "image/gif" || fl.type === "image/avif" || fl.size < 300_000) return fl;
      try {
        const bmp = await createImageBitmap(fl);
        const k = Math.min(1, 1920 / Math.max(bmp.width, bmp.height));
        const c = document.createElement("canvas");
        c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
        c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
        const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, "image/webp", 0.88));
        if (blob && blob.size < fl.size) return new File([blob], fl.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
      } catch {}
      return fl;
    }
    async function up(orig: File) {
      setBusy(true); setPct(0);
      const fl = await shrink(orig);
      const fd = new FormData(); fd.append("file", fl);
      await new Promise<void>((done) => {
        const x = new XMLHttpRequest();
        x.open("POST", "/admin/upload");
        x.timeout = 120_000;
        x.upload.onprogress = (e) => { if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100)); };
        x.onload = () => {
          try { const j = JSON.parse(x.responseText); if (j.url) setImg(j.url); else alert(j.error ?? "Falha no upload"); }
          catch { alert("Falha no upload"); }
          done();
        };
        x.onerror = () => { alert("Falha no upload. Verifique a conexão."); done(); };
        x.ontimeout = () => { alert("O envio demorou demais. Tente uma imagem menor."); done(); };
        x.send(fd);
      });
      setBusy(false);
    }
    return (
      <div className={`flex flex-col gap-1.5 ${f.wide ? "sm:col-span-2" : ""}`}>
        <span className="font-semibold text-[11px] text-zinc-400 uppercase tracking-wider">{f.label}</span>
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); const fl = e.dataTransfer.files?.[0]; if (fl) up(fl); }}
          className={`flex items-center gap-4 rounded-xl border border-dashed p-3 transition ${drag ? "border-[#d3b993] bg-[#d3b993]/10" : "border-zinc-700 bg-zinc-950/40"}`}
        >
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-800">
            {img ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt="" className="h-full w-full object-contain" /> : <FaImage className="text-zinc-600" size={28} />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <button type="button" onClick={() => file.current?.click()} disabled={busy}
              className="flex w-fit items-center gap-2 rounded-lg bg-[#d3b993] px-4 py-2 font-bold text-black text-sm transition hover:brightness-110 disabled:opacity-60">
              <FaCloudArrowUp />{busy ? (pct > 0 ? `Enviando... ${pct}%` : "Preparando...") : img ? "Trocar imagem" : "Enviar imagem"}
            </button>
            <span className="text-xs text-zinc-500">ou arraste a imagem para cá</span>
            <input name={f.name} value={img} onChange={(e) => setImg(e.target.value)} placeholder="ou cole a URL da imagem" className={`${base} !py-1.5 !text-xs`} />
            <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { const fl = e.target.files?.[0]; if (fl) up(fl); e.target.value = ""; }} />
          </div>
        </div>
      </div>
    );
  }
  return wrap(<input name={f.name} defaultValue={String(value ?? "")} className={base} />);
}
