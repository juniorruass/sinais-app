import type { Game } from "@/lib/data";

export default function DistributionsCarousel({ games }: { games: Game[] }) {
  return (
    <div className="relative">
      <div className="flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((g) => (
          <a key={g.id} href={g.link_casa ?? "#"} target="_blank" rel="noopener noreferrer"
            className="relative block h-[150px] w-[130px] shrink-0 snap-start overflow-hidden rounded-2xl shadow-black shadow-xl transition-opacity hover:opacity-90">
            <img alt={g.nome} src={g.image_url ?? "/placeholder.png"} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute top-2 right-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-2 py-0.5 font-bold text-[11px] text-black">{g.porcentagem}%</div>
            <div className="absolute inset-x-0 bottom-0 flex items-end bg-linear-to-t from-black/90 to-transparent px-2 pt-6 pb-2">
              <span className="font-bold text-white text-xs leading-tight">{g.nome}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
