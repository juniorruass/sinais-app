"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaXmark } from "react-icons/fa6";
import type { Popup } from "@/lib/data";

const KEY = "popup_dismissed_at";
let shown = false;

export default function PopupBanner({ popups, hours, cta }: { popups: Pick<Popup, "image_url" | "link" | "peso">[]; hours: number; cta: string }) {
  const [cur, setCur] = useState<Pick<Popup, "image_url" | "link" | "peso"> | null>(null);
  const [skip, setSkip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (shown || !popups.length) return;
    const t = localStorage.getItem(KEY);
    if (t && Date.now() - Number(t) < hours * 3600_000) return;
    shown = true;
    // sorteio ponderado pelo peso definido no admin
    const w = popups.map((p) => Math.max(0, p.peso ?? 1));
    const total = w.reduce((x, y) => x + y, 0);
    if (!total) return;
    let r = Math.random() * total, i = 0;
    while (i < w.length - 1 && r >= w[i]) { r -= w[i]; i++; }
    const pick = popups[i];
    setCur(pick);
  }, [popups, hours]);

  useEffect(() => {
    if (!cur) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [cur]);

  function close() {
    if (skip) localStorage.setItem(KEY, Date.now().toString());
    setCur(null);
  }
  if (!mounted || !cur) return null;
  return createPortal(
    <div className="fixed inset-0 z-300 flex items-center justify-center p-6 transition-opacity duration-300" style={{ opacity: loaded ? 1 : 0 }}>
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-xs overflow-hidden rounded-2xl">
        <button type="button" onClick={close} className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-black/80"><FaXmark size={14} /></button>
        <a href={cur.link ?? "#"} target="_blank" rel="noopener noreferrer" onClick={close} className="block">
          <img src={cur.image_url} alt="Promoção" width={384} height={538} onLoad={() => setLoaded(true)} style={{ display: "block", width: "100%", height: "auto", maxHeight: "calc(85dvh - 100px)" }} />
        </a>
        <div className="bg-panel px-4 py-3">
          <label className="mb-3 flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={skip} onChange={(e) => setSkip(e.target.checked)} className="h-4 w-4 cursor-pointer accent-primary" />
            <span className="text-white/60 text-xs">Não mostrar por {hours} horas</span>
          </label>
          <div className="flex gap-2">
            <a href={cur.link ?? "#"} target="_blank" rel="noopener noreferrer" onClick={close} className="flex flex-1 items-center justify-center rounded-lg bg-linear-to-r from-gradient-start to-gradient-end py-2.5 font-bold text-btn text-sm transition-opacity hover:opacity-90">{cta}</a>
            <button type="button" onClick={close} className="flex-1 rounded-lg border border-white/20 py-2.5 font-bold text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white">Fechar</button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
