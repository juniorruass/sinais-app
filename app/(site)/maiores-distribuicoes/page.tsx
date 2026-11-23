import GamesBrowser from "@/components/GamesBrowser";
import { getFavoriteIds, getSettings, getTopDistributions, getUser } from "@/lib/data";

export default async function Maiores() {
  const [s, games, user] = await Promise.all([getSettings(), getTopDistributions(40), getUser()]);
  const favs = await getFavoriteIds(user?.id);
  return (
    <div className="container mx-auto max-w-5xl px-4">
      <div className="flex flex-col items-center py-4">
        <div className="relative flex items-center">
          <img alt="" width={221} height={221} src="/icons/theme-icons/gucci/dt-icon.png" className="absolute -top-2 -left-2 h-10 w-10 md:-top-3 md:-left-14 md:h-12 md:w-12" />
          <h2 className="ml-10 font-bold text-xl uppercase tracking-wider md:ml-0 md:text-[26px]">{s.distributions_title}</h2>
        </div>
      </div>
      <GamesBrowser games={games} favoriteIds={favs} userId={user?.id} placeholder={s.search_placeholder} />
    </div>
  );
}
