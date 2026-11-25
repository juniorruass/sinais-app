"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TbNavigationFilled } from "react-icons/tb";

const MSG: Record<string, string | null> = {
  idle: null, waiting: "Atualizando sinais...", almost: "Quase lá...", success: "Novos sinais encontrados!",
};

export default function NextUpdateFloat({ intervalMin }: { intervalMin: number }) {
  const ms = Math.max(1, intervalMin) * 60_000;
  const router = useRouter();
  const [pending, start] = useTransition();
  const [left, setLeft] = useState<number | null>(null);
  const [phase, setPhase] = useState<keyof typeof MSG>("idle");
  const last = useRef<number | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    const calc = () => Math.max(0, Math.floor((ms * Math.ceil((Date.now() + 1) / ms) - Date.now()) / 1000));
    setLeft(calc()); last.current = calc();
    const t = setInterval(() => {
      const n = calc();
      if (last.current !== null && n > last.current && !busy.current) update();
      last.current = n;
      if (!busy.current) setLeft(n);
    }, 1000);
    function update() {
      busy.current = true; setPhase("waiting");
      const a = setTimeout(() => setPhase("almost"), 3000);
      setTimeout(() => {
        clearTimeout(a);
        setPhase("success");
        start(() => router.refresh());
        setTimeout(() => { busy.current = false; setPhase("idle"); }, 2500);
      }, 4000 + Math.random() * 4000);
    }
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms]);

  const total = ms / 1000;
  const progress = Math.min(100, ((total - (left ?? total)) / total) * 100);
  const deg = (progress / 100) * 360;
  const seg = Array.from({ length: 12 }, (_, i) => {
    const a = i * 30, b = a + 30, c = b - 4;
    return `${a < deg ? "var(--color-primary)" : "color-mix(in srgb, var(--color-primary) 35%, white)"} ${a}deg ${c}deg, white ${c}deg ${b}deg`;
  }).join(", ");
  const text = MSG[phase] ?? `Próxima Atualização: ${left !== null ? `${Math.floor(left / 60)}m ${String(left % 60).padStart(2, "0")}seg` : "--m --seg"}`;

  return (
    <div className="fixed right-0 bottom-24 z-40 flex items-center">
      <div className="flex items-center gap-2 rounded-full rounded-tr-none border-2 border-field-text/20 bg-field py-2.5 pr-8 pl-4 shadow-lg">
        <TbNavigationFilled className="ml-auto rotate-90 text-field-text" />
        <span className="whitespace-nowrap font-bold text-field-text text-xs">{text}</span>
      </div>
      <div className={`-ml-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-md ${phase !== "idle" || pending ? "animate-pulse" : ""}`} style={{ background: `conic-gradient(from -90deg, ${seg})` }}>
        <div className="h-4 w-4 rounded-full bg-field-text" />
      </div>
    </div>
  );
}
