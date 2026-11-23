"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "INÍCIO", icon: "/nav/home.png", ar: "528 / 512", w: "w-6 md:w-8", extra: "" },
  { href: "/pg-soft", label: "PG GAMES", icon: "/nav/pg.png", ar: "577 / 310", w: "w-9 md:w-12", extra: "" },
  { href: "/pragmatic", label: "PP GAMES", icon: "/nav/pp.png", ar: "318 / 441", w: "w-6.5 md:w-8", extra: "mb-2" },
  { href: "/wg-games", label: "WG GAMES", icon: "/nav/wg.png", ar: "967 / 496", w: "w-9 md:w-12", extra: "" },
  { href: "/tada-gaming", label: "TADA GAMING", icon: "/nav/tada.png", ar: "452 / 177", w: "w-12 md:w-15", extra: "" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <div className="fixed right-0 bottom-0 left-0 z-30 mx-auto w-full pt-4 shadow-lg">
      <nav className="mt-4 flex items-center border-gradient border-t-4 bg-white font-bold text-[11px]">
        {ITEMS.map((it) => {
          const active = it.href === "/" ? path === "/" : path === it.href;
          const mask = `url(${it.icon})`;
          return (
            <Link key={it.href} href={it.href} className={`flex w-full flex-col text-black items-center justify-center gap-1 p-2 transition-all duration-300 hover:bg-black/10 ${active ? "bg-black/5" : ""}`}>
              <div className="flex h-8 items-center justify-center">
                <span role="img" aria-hidden="true" className={`inline-block shrink-0 ${active ? "bg-primary" : "bg-black"} ${it.w} ${it.extra}`}
                  style={{ aspectRatio: it.ar, maskImage: mask, WebkitMaskImage: mask, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" }} />
              </div>
              <span className="whitespace-nowrap">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
