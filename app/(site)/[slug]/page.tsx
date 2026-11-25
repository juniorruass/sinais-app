import { notFound } from "next/navigation";
import ContentPage from "@/components/ContentPage";
import GamesBrowser from "@/components/GamesBrowser";
import { createClient } from "@/lib/supabase/server";
import { currentDomain, getFavoriteIds, getGames, getSettings, getUser } from "@/lib/data";

const CATS: Record<string, { cat: string; cover: string; alt: string }> = {
  "pg-soft": { cat: "PG", cover: "cover_pg", alt: "PG Soft" },
  pragmatic: { cat: "PP", cover: "cover_pp", alt: "Pragmatic Play" },
  "wg-games": { cat: "WG", cover: "cover_wg", alt: "WG Games" },
  "tada-gaming": { cat: "TADA", cover: "cover_tada", alt: "Tada Gaming" },
};

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CATS[slug];
  if (c) {
    const [s, games, user] = await Promise.all([getSettings(), getGames(c.cat), getUser()]);
    const favs = await getFavoriteIds(user?.id);
    return (
      <div className="relative">
        <div className="mx-auto w-full max-w-5xl">
          <div className="relative w-full overflow-hidden pb-6">
            <div className="relative mx-auto w-full max-w-3xl shrink-0 overflow-hidden rounded-4xl">
              <img alt={c.alt} src={s[c.cover]} className="block h-auto w-full" />
            </div>
          </div>
        </div>
        <GamesBrowser games={games} favoriteIds={favs} userId={user?.id} placeholder={s.search_placeholder} />
      </div>
    );
  }
  // Página de conteúdo editável pelo admin (FAQ, domínios oficiais, etc.)
  const sb = await createClient();
  const { data: page } = await sb.from("pages").select("title,content").eq("slug", slug).eq("ativo", true).maybeSingle();
  if (!page) notFound();
  let content = page.content as string;
  if (slug === "dominios-oficiais") {
    // O domínio em uso aparece sempre, automático; linhas do admin entram como domínios extras.
    const host = await currentDomain();
    if (host) {
      const ext = "." + host.split(".").slice(1).join(".").toUpperCase();
      const extra = content.split("\n").filter((l) => l.trim() && !l.toLowerCase().includes(host));
      content = [`${ext} | ${host} | online`, ...extra].join("\n");
    }
  }
  return <ContentPage slug={slug} title={page.title} content={content} />;
}
