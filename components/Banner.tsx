"use client";
import { useEffect, useRef, useState } from "react";
import type { Slide } from "@/lib/data";

export default function Banner({ slides }: { slides: Pick<Slide, "image_url" | "alt" | "link">[] }) {
  const [i, setI] = useState(0);
  const touch = useRef(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);
  if (!slides.length) return null;
  const single = slides.length === 1;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="relative w-full overflow-hidden"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - touch.current; if (Math.abs(d) > 40) setI((p) => (p + (d < 0 ? 1 : -1) + slides.length) % slides.length); }}>
        <div className="flex" style={{ gap: 0, transform: `translateX(calc(-${i} * 100%))`, transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)" }}>
          {slides.map((s, k) => {
            const style = { width: single ? "100%" : "calc(100% - 16px)", filter: k === i ? "none" : "blur(3px) brightness(0.7)", transform: k === i ? "scale(1)" : "scale(0.97)", transition: "filter 0.5s ease, transform 0.5s ease" };
            const cls = "relative aspect-[1920/1080] shrink-0 overflow-hidden rounded-4xl ml-2";
            const img = <img alt={s.alt ?? `Banner ${k + 1}`} className="absolute inset-0 h-full w-full object-cover" src={s.image_url} />;
            const ext = s.link?.startsWith("http");
            return s.link ? (
              <a key={k} href={s.link} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`${cls} cursor-pointer`} style={style}>{img}</a>
            ) : (
              <div key={k} className={cls} style={style}>{img}</div>
            );
          })}
        </div>
      </div>
      {!single && (
        <div className="mt-3 flex justify-center gap-2">
          {slides.map((_, k) => (
            <button key={k} type="button" aria-label={`Banner ${k + 1}`} onClick={() => setI(k)}
              className={`h-2 rounded-full transition-all duration-300 ${k === i ? "w-6 bg-white" : "w-2 bg-white/40"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
