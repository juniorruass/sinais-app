"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaStar, FaHeart } from "react-icons/fa6";
import { TbWorldSearch } from "react-icons/tb";
import type { Game } from "@/lib/data";
import GameCard from "./GameCard";

export default function GamesBrowser({
  games, favoriteIds, userId, placeholder,
}: { games: Game[]; favoriteIds: number[]; userId?: string; placeholder: string }) {
  const [tab, setTab] = useState<"all" | "fav">("all");
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<Set<number>>(new Set(favoriteIds));

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return games.filter((g) => (tab === "all" || favs.has(g.id)) && (!t || g.nome.toLowerCase().includes(t)));
  }, [games, tab, q, favs]);

  const [shown, setShown] = useState(20);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => { setShown(20); }, [tab, q]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) setShown((n) => n + 20); }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [list.length, shown]);

  function onFav(id: number, v: boolean) {
    setFavs((p) => { const n = new Set(p); if (v) n.add(id); else n.delete(id); return n; });
  }

  return (
    <>
      <div className="relative mx-auto mt-4 flex max-w-sm items-center justify-center gap-2 rounded-full bg-black/40 p-1.5 px-6 sm:max-w-3xl">
        <div className="absolute -top-4 -left-2"><img alt="filter" width={28} height={41} src="/icons/theme-icons/gucci/bee.png" /></div>
        <div className="absolute -right-2 -bottom-2"><img alt="filter" width={38} height={37} src="/icons/theme-icons/gucci/bee-solo.png" /></div>
        <button type="button" onClick={() => setTab("all")} className={`flex w-full items-center justify-center gap-2 rounded-full py-2 font-black text-sm transition-all duration-300 sm:text-base ${tab === "all" ? "bg-linear-to-r from-gradient-start to-gradient-end text-black" : "text-white/70 hover:text-white"}`}>
          <FaStar size={tab === "all" ? 24 : 18} />Todos
        </button>
        <button type="button" onClick={() => setTab("fav")} className={`flex w-full items-center justify-center gap-2 rounded-full py-2 font-black text-sm transition-all duration-300 sm:text-base ${tab === "fav" ? "bg-linear-to-r from-gradient-start to-gradient-end text-black" : "text-white/70 hover:text-white"}`}>
          <FaHeart size={tab === "fav" ? 24 : 18} />Favoritos
        </button>
      </div>
      <div className="mx-auto my-6 max-w-3xl px-4">
        <div className="relative flex h-11 w-full items-center rounded-full bg-white">
          <div className="absolute -top-3 -right-3"><img alt="filter" width={77} height={63} src="/icons/theme-icons/gucci/search-right.png" /></div>
          <div className="-translate-1/2 absolute top-1/2 left-8 rounded-full bg-black p-1"><TbWorldSearch className="size-7 text-white" /></div>
          <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
            className="ml-12 h-full w-full rounded-r-full pl-4 font-semibold text-black placeholder:text-black focus-visible:outline-0" />
        </div>
      </div>
      <div className="container mx-auto max-w-5xl px-4">
        {list.length === 0 ? (
          <p className="py-10 text-center text-white/60">{tab === "fav" ? (userId ? "Você ainda não favoritou nenhum jogo." : "Entre na sua conta para ver seus favoritos.") : "Nenhum jogo encontrado."}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 justify-items-center">
            {list.slice(0, shown).map((g) => <GameCard key={g.id} game={g} userId={userId} isFavorited={favs.has(g.id)} onFav={onFav} />)}
          </div>
        )}
        {shown < list.length && <div ref={sentinel} className="h-10" />}
      </div>
    </>
  );
}
