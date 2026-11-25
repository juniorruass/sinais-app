"use client";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard?.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-4 py-1.5 font-bold text-btn text-xs uppercase">
      {ok ? "Copiado!" : "Copiar link"}
    </button>
  );
}
