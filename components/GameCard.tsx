"use client";
import { useState, useMemo } from "react";
import { FaHeart, FaRegHeart, FaFireFlameCurved } from "react-icons/fa6";
import type { Game } from "@/lib/data";
import { toggleFavorite } from "@/app/actions";

function barColor(v: number) {
  return v >= 70 ? "bg-[#59e479]" : v >= 40 ? "bg-[#F8CD4D]" : "bg-[#ff3232]";
}

function Bar({ label, v }: { label: string; v: number }) {
  return (
    <div>
      {label}: {v}%
      <div className="loadingBar mt-1 h-3 w-full rounded-xl bg-white/20">
        <div className={`loadingBarInner ${barColor(v)}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-[11px] uppercase">
    <span className="font-bold">{label}:</span>
    <span className="flex items-center justify-center rounded bg-secondary px-2 py-0.5 font-bold text-[10px] text-white">{value}</span>
  </div>
);
const Chip = ({ value }: { value: string }) => (
  <div className="flex flex-1 items-center justify-center rounded bg-secondary py-1 font-bold text-[10px] text-white">{value}</div>
);

// Sugestão de apostas (somente para usuário logado) — mesma lógica do site original
function suggest(padrao: number, minima: number, maxima: number, bets: string[]) {
  if (!bets.length) return null;
  const bonusIdx = (v: number) => (v < 50 ? null : v >= 90 ? 1 : v >= 80 ? 2 : v >= 70 ? 3 : v >= 60 ? 4 : 5);
  const connIdx = (v: number) => Math.min(Math.floor(v / 10) + 1, 10);
  const e = Math.max(1, Math.floor(bets.length / 3));
  const pick = (zone: "minimum" | "standard" | "maximum", t: number) => {
    if (!bets.length || t <= 0) return "";
    const a = Math.min(e, Math.max(1, Math.ceil((t / 10) * e)));
    const idx = (zone === "minimum" ? e : zone === "maximum" ? 2 * e : 0) + a - 1;
    return idx < bets.length ? bets[idx] : "";
  };
  const bP = bonusIdx(padrao), cP = connIdx(padrao);
  const extra = Math.min(Math.max(Math.round((0.3 * padrao + 0.2 * minima + 0.5 * maxima) / 10), 1), 10);
  const bM = bonusIdx(minima), cM = connIdx(minima), bX = bonusIdx(maxima), cX = connIdx(maxima);
  return {
    min: { bonus: bP, bonusValue: bP ? pick("standard", bP) : "", connectionValue: pick("standard", cP), extraValue: pick("standard", extra) },
    std: { bonusValue: bM ? pick("minimum", bM) : "", connectionValue: pick("minimum", cM) },
    max: { bonusValue: bX ? pick("maximum", bX) : "", connectionValue: pick("maximum", cX) },
  };
}

export default function GameCard({
  game: g, userId, isFavorited, onFav,
}: { game: Game; userId?: string; isFavorited: boolean; onFav?: (id: number, v: boolean) => void }) {
  const [fav, setFav] = useState(isFavorited);
  const [needLogin, setNeedLogin] = useState(false);
  const bets = g.bets ?? [];

  const ranges = useMemo(() => {
    if (!bets.length) return null;
    const e = Math.max(1, Math.floor(bets.length / 3));
    return { minima: [0, e - 1], padrao: [e, Math.min(2 * e - 1, bets.length - 1)], maxima: Math.min(2 * e, bets.length - 1) };
  }, [bets]);
  const sug = useMemo(() => suggest(g.padrao, g.minima, g.maxima, bets), [g, bets]);

  const anyHigh = g.minima > 90 || g.padrao > 90 || g.maxima > 90;
  const name = g.nome.toLowerCase();
  const hot = anyHigh && ["PG", "WG", "TADA", "PP"].includes(g.categoria) &&
    (g.categoria === "TADA" || g.categoria === "WG" ||
      (name.startsWith("fortune") && !["fortune dogs", "fortune snake", "fortune gods"].includes(name)));
  const plus90 = (g.categoria === "PP" || (!name.startsWith("fortune") && g.categoria === "PG") || name === "fortune snake") && anyHigh;
  const loggedPanel = !!userId && sug !== null;
  const href = g.link_casa ?? "#";

  async function onHeart(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!userId) return setNeedLogin(true);
    const next = !fav;
    setFav(next); onFav?.(g.id, next);
    try { await toggleFavorite(g.id); } catch { setFav(!next); onFav?.(g.id, !next); }
  }

  return (
    <div className="game relative my-1 flex w-full max-w-[215px] flex-col overflow-hidden rounded-xl shadow-black shadow-xl sm:min-w-[157px] sm:max-w-[175px]" style={{ backgroundColor: g.color_bg ?? "#222" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${g.image_url})`, backgroundSize: "auto", backgroundPosition: "50% -70%", backgroundRepeat: "no-repeat", filter: "blur(16px)", transform: "scale(1.1)", zIndex: 0 }} />
      <button type="button" onClick={onHeart} className="absolute top-[5px] right-[7px] z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 transition-colors hover:bg-black/50">
        {fav ? <FaHeart className="text-white" size={14} /> : <FaRegHeart className="text-white" size={14} />}
      </button>
      {(hot || plus90) && (
        <div className="absolute top-[2px] left-[2px] z-20 flex h-6 animate-pulse items-center justify-center gap-1 rounded-md bg-secondary px-3">
          <p className="font-medium text-base text-zinc-50">{hot ? "HOT" : "+90%"}</p>
          <FaFireFlameCurved className="size-4 animate-pulse text-red-50" />
        </div>
      )}
      <a href={href} target="_blank" rel="noopener noreferrer" className="relative block transition-all duration-300 hover:opacity-75">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={g.nome} width={470} height={470} loading="lazy" decoding="async" src={g.image_url ?? "/placeholder.png"} className="h-[150px] w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/60 to-transparent" />
      </a>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <div className="gameContent relative -top-1 z-20 flex min-h-[267px] flex-col justify-between bg-linear-to-b from-black/80 to-transparent pt-[10px]">
          <div className="flex items-center gap-2 px-2 pb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={g.nome} width={55} height={55} loading="lazy" src={g.icon_url ?? "/placeholder.png"} className="h-[50px] w-[55px] rounded-xl object-cover" />
            <span className="font-bold text-sm leading-tight">{g.nome}</span>
          </div>
          <div className="flex flex-col gap-[5px] px-3 py-1 text-center text-[13px]">
            <Bar label="Aposta Mínima" v={g.minima} />
            <Bar label="Aposta Padrão" v={g.padrao} />
            <Bar label="Aposta Máxima" v={g.maxima} />
          </div>
          <span className="distribution">Distribuição: {g.porcentagem}%</span>
          {!userId && ranges && (
            <div className="mx-2 my-2 rounded-2xl bg-black/30 p-2">
              <div className="flex flex-col gap-0.5 text-center text-[11px] text-white/80">
                {bets[ranges.minima[0]] && <span>Mínima R${bets[ranges.minima[0]]} a R${bets[ranges.minima[1]]}</span>}
                {bets[ranges.padrao[0]] && <span>Padrão R${bets[ranges.padrao[0]]} a R${bets[ranges.padrao[1]]}</span>}
                {bets[ranges.maxima] && <span>Máxima acima de R${bets[ranges.maxima]}</span>}
              </div>
            </div>
          )}
          {loggedPanel && sug && (
            <div className="mx-2 my-2 rounded-2xl bg-black/30 p-2">
              <h4 className="mb-1 text-center font-bold text-[13px] text-yellow-400">APOSTAS SUGERIDAS</h4>
              {(sug.min.bonusValue || sug.min.connectionValue || sug.min.extraValue) && (
                <div>
                  <p className="text-center font-bold text-[11px] text-white">MÍNIMA</p>
                  <div className="space-y-0.5">
                    {sug.min.bonus && sug.min.bonusValue && <Row label="Bet Bônus" value={sug.min.bonusValue} />}
                    {sug.min.connectionValue && <Row label="Bet Conexão" value={sug.min.connectionValue} />}
                    {sug.min.extraValue && <Row label="Bet Extra" value={sug.min.extraValue} />}
                  </div>
                </div>
              )}
              {(sug.std.bonusValue || sug.std.connectionValue) && (
                <div className="mt-1"><p className="text-center font-bold text-[11px] text-white">PADRÃO</p>
                  <div className="flex gap-1">{sug.std.bonusValue && <Chip value={sug.std.bonusValue} />}{sug.std.connectionValue && <Chip value={sug.std.connectionValue} />}</div></div>
              )}
              {(sug.max.bonusValue || sug.max.connectionValue) && (
                <div className="mt-1"><p className="text-center font-bold text-[11px] text-white">MÁXIMA</p>
                  <div className="flex gap-1">{sug.max.bonusValue && <Chip value={sug.max.bonusValue} />}{sug.max.connectionValue && <Chip value={sug.max.connectionValue} />}</div></div>
              )}
            </div>
          )}
        </div>
      </a>
      {hot || plus90 ? (
        <div className="relative z-10 mx-auto mt-auto mb-3 w-[90%]">
          <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full animate-pulse rounded-xl bg-primary px-1 py-3 text-center font-bold text-sm text-white transition-opacity hover:opacity-80">JOGUE AGORA</a>
        </div>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer" className="relative z-10 mx-auto mt-auto mb-3 flex w-[90%] items-center justify-center gap-1 rounded-full bg-primary py-3 font-semibold text-sm text-white transition-opacity hover:opacity-80">
          Jogar
          <svg aria-hidden="true" className="relative ml-1 w-[8px] fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" /></svg>
        </a>
      )}
      {needLogin && (
        <div className="fixed inset-0 z-300 flex items-end justify-center bg-black/60" onClick={() => setNeedLogin(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-black p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="mb-4 font-bold">Entre para favoritar jogos e ver apostas sugeridas</p>
            <a href="/login" className="mb-2 block rounded-full bg-linear-to-r from-gradient-start to-gradient-end py-3 font-bold text-black">Entrar</a>
            <a href="/cadastro" className="block rounded-full border border-white/20 py-3 font-bold">Cadastre-se</a>
          </div>
        </div>
      )}
    </div>
  );
}
