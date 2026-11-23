import Link from "next/link";
import Banner from "@/components/Banner";
import GamesBrowser from "@/components/GamesBrowser";
import DistributionsCarousel from "@/components/DistributionsCarousel";
import { getFavoriteIds, getGames, getPlatforms, getSettings, getSlides, getTopDistributions, getUser } from "@/lib/data";

export default async function Home() {
  const [s, slides, platforms, top, games, user] = await Promise.all([
    getSettings(), getSlides(), getPlatforms(), getTopDistributions(20), getGames("PG", 20), getUser(),
  ]);
  const favs = await getFavoriteIds(user?.id);
  return (
    <div>
      <Banner slides={slides} />
      <div className="container mx-auto my-8 max-w-5xl">
        <div className="relative mx-12 rounded-[50px] border-2 border-secondary bg-[#282828] py-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-[-50%]"><img alt="" width={1032} height={192} src="/icons/theme-icons/gucci/rp-top.png" className="h-auto w-3xs min-w-52" /></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[50%]"><img alt="" width={2832} height={546} src="/icons/theme-icons/gucci/rp-bottom.png" className="h-auto w-xs min-w-3xs" /></div>
          <div className="flex flex-col items-center">
            <h2 className="font-bold text-[22px] uppercase md:text-[26px]">{s.platforms_title}</h2>
            <small className="text-[11px] tracking-wider md:text-sm">{s.platforms_subtitle}</small>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-center gap-4 py-8">
            {platforms.map((p) => (
              <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer" className="relative transition-transform duration-300 hover:scale-105">
                <img src={p.image_url} alt={p.nome ?? ""} width={85} height={85} className="size-[85px] rounded-[13px] object-cover" />
                {p.badge && <div className="w-fit rounded-lg bg-linear-to-r from-gradient-start to-gradient-end px-3 py-0.5 font-bold text-[11px] text-black uppercase tracking-wider absolute -top-2 -right-2">{p.badge}</div>}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center">
          <div className="relative flex items-center">
            <img alt="" width={221} height={221} src="/icons/theme-icons/gucci/dt-icon.png" className="absolute -top-2 -left-2 h-10 w-10 md:-top-3 md:-left-14 md:h-12 md:w-12" />
            <h2 className="ml-10 font-bold text-xl uppercase tracking-wider md:ml-0 md:text-[26px]">{s.distributions_title}</h2>
          </div>
        </div>
        <div className="-mx-4 mt-4 ml-2"><DistributionsCarousel games={top} /></div>
        <div className="mt-2 flex w-full justify-center">
          <Link href="/maiores-distribuicoes" className="rounded-xl px-3 py-0.5 font-semibold text-sm text-white/50 uppercase hover:bg-white/20">Ver mais</Link>
        </div>
      </div>
      <GamesBrowser games={games} favoriteIds={favs} userId={user?.id} placeholder={s.search_placeholder} />
    </div>
  );
}
