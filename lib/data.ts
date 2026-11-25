import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type Game = {
  id: number; nome: string; categoria: "PG" | "PP" | "WG" | "TADA";
  image_url: string | null; icon_url: string | null; color_bg: string | null;
  porcentagem: number; minima: number; padrao: number; maxima: number;
  link_casa: string | null; bets: string[]; fixo: boolean; ativo: boolean; ordem: number;
};
export type Platform = { id: number; nome: string | null; image_url: string; link: string; badge: string | null; peso?: number };
export type Slide = { id: number; image_url: string; alt: string | null; link: string | null };
export type Popup = { id: number; image_url: string; link: string | null; peso?: number };
export type MenuItem = { id: number; label: string; href: string; icon_url: string | null; externo: boolean };
export type Settings = Record<string, string>;

export const SETTING_DEFAULTS: Settings = {
  brand_name: "Anderson Slots",
  site_title: "Anderson Slots - Sinais Oficial",
  site_description: "Anderson Slots - Sinais e estratégias para alavancar seus ganhos!",
  site_domain: "auto",
  logo_url: "/logo.svg",
  color_primary: "#d3b993",
  color_gradient_start: "#d3b993",
  color_gradient_end: "#9c8460",
  color_secondary: "#d7cbb4",
  cover_pg: "/banners/anderson/pg.webp",
  cover_pp: "/banners/anderson/pp.webp",
  cover_wg: "/banners/anderson/wg.webp",
  cover_tada: "/banners/anderson/tada.webp",
  platforms_title: "Plataformas Indicadas",
  platforms_subtitle: "SOMENTE PLATAFORMAS COM LAYOUT'S ORIGINAIS",
  distributions_title: "Maiores Distribuições Hoje:",
  search_placeholder: "Pesquise o seu jogo aqui",
  footer_resp_title: "Compromisso com o jogo",
  footer_resp_highlight: "Responsável!",
  footer_resp_text:
    "No {brand} incentivamos o jogo consciente e responsável. Nosso foco é oferecer entretenimento de o jogo consciente e responsável. Lembre-se: jogos devem ser apenas lazer, nunca fonte de renda. Jogue sempre com moderação.",
  footer_legal_title: "Aviso Legal!",
  footer_legal_text:
    "O site {domain} é uma plataforma independente com conteúdo únicamente informativo sobre jogos e cassino online. Recomendamos que usuários revejam as leis de sua região antes de participar de qualquer atividade relacionada a jogos. Jogue sempre com responsabilidade.",
  footer_18_text: "Acesso totalmente proibido para menores de 18 anos de idade! Fique atento as régras!",
  support_link: "",
  signals_auto: "true",
  signals_interval_min: "5",
  signals_slot: "0",
  popup_hours: "3",
};

/** Domínio em que o site está sendo acessado agora (muda sozinho se você trocar de domínio). */
export async function currentDomain(): Promise<string> {
  const h = await headers();
  const raw = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
  return /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(raw) ? raw : "";
}

export async function getSettings(): Promise<Settings> {
  const sb = await createClient();
  const { data } = await sb.from("site_settings").select("key,value");
  const s = { ...SETTING_DEFAULTS };
  for (const r of data ?? []) if (r.value !== "" || !(r.key in s)) s[r.key] = r.value;
  // site_domain vazio ou "auto" = usa o domínio de acesso; preencher no admin força um domínio fixo.
  if (!s.site_domain || s.site_domain.toLowerCase() === "auto") s.site_domain = (await currentDomain()) || "localhost";
  return s;
}

/** Dispara a atualização dos sinais (no banco) quando o intervalo virou. */
export async function refreshSignals() {
  const sb = await createClient();
  await sb.rpc("refresh_signals");
}

/** Cada jogo sorteia uma plataforma ativa, proporcional ao peso definido no admin.
 *  O link próprio do jogo (se preenchido) tem prioridade. Peso 0 = a plataforma não recebe jogos. */
async function withLinks(games: Game[]): Promise<Game[]> {
  const pool = (await getPlatforms()).filter((p) => p.link && (p.peso ?? 1) > 0);
  const total = pool.reduce((s, p) => s + (p.peso ?? 1), 0);
  const pick = () => {
    if (!pool.length) return null;
    let r = Math.random() * total;
    for (const p of pool) { r -= p.peso ?? 1; if (r < 0) return p.link; }
    return pool[pool.length - 1].link;
  };
  return games.map((g) => ({ ...g, link_casa: g.link_casa?.trim() || pick() }));
}

export async function getGames(categoria?: string, limit?: number): Promise<Game[]> {
  const sb = await createClient();
  let q = sb.from("games").select("*").eq("ativo", true);
  if (categoria) q = q.eq("categoria", categoria);
  q = q.order("ordem").order("id");
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return withLinks((data ?? []) as Game[]);
}

export async function getTopDistributions(limit = 20): Promise<Game[]> {
  const sb = await createClient();
  const { data } = await sb.from("games").select("*").eq("ativo", true)
    .order("porcentagem", { ascending: false }).limit(limit);
  return withLinks((data ?? []) as Game[]);
}

async function list<T>(table: string): Promise<T[]> {
  const sb = await createClient();
  const { data } = await sb.from(table).select("*").eq("ativo", true).order("ordem").order("id");
  return (data ?? []) as T[];
}
export const getPlatforms = () => list<Platform>("platforms");
export const getSlides = () => list<Slide>("slides");
export const getPopups = () => list<Popup>("popups");
export const getMenuItems = () => list<MenuItem>("menu_items");

export async function getUser() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("name,role,is_vip").eq("id", user.id).maybeSingle();
  return { id: user.id, email: user.email ?? "", name: profile?.name ?? user.email ?? "", role: (profile?.role ?? "user") as string, isVip: !!profile?.is_vip };
}

export async function getFavoriteIds(userId?: string): Promise<number[]> {
  if (!userId) return [];
  const sb = await createClient();
  const { data } = await sb.from("favorites").select("game_id").eq("user_id", userId);
  return (data ?? []).map((r) => r.game_id as number);
}

export function fmt(tpl: string, s: Settings) {
  return tpl.replaceAll("{brand}", s.brand_name).replaceAll("{domain}", s.site_domain);
}
