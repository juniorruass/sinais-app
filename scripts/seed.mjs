// Popula o banco (rodar UMA vez): node --env-file=.env.local scripts/seed.mjs
// Sobe as imagens (antes na Cloudflare) para o Storage 'media' e cadastra jogos, plataformas, banners, popups, menu e páginas.
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const data = JSON.parse(fs.readFileSync(path.join(dir, "seed-data.json"), "utf8"));

const cache = new Map();
async function img(u) {
  if (!u) return null;
  if (!u.startsWith("http")) return u; // já é arquivo local do /public
  if (cache.has(u)) return cache.get(u);
  const key = u.replace("https://imagedelivery.net/", "").replaceAll("/", "_");
  const file = path.join(dir, "seed-images", key);
  if (!fs.existsSync(file)) return u;
  const buf = fs.readFileSync(file);
  const type = buf[0] === 0x89 ? "image/png" : buf[0] === 0xff ? "image/jpeg" : buf.subarray(0, 4).toString() === "RIFF" ? "image/webp" : "image/png";
  const ext = type.split("/")[1];
  const p = `seed/${key.split("_").slice(1, -1).join("_") || key}.${ext}`;
  const { error } = await sb.storage.from("media").upload(p, buf, { contentType: type, upsert: true });
  if (error) throw new Error(`upload ${p}: ${error.message}`);
  const url = sb.storage.from("media").getPublicUrl(p).data.publicUrl;
  cache.set(u, url);
  return url;
}
const ins = async (t, rows) => { const { error } = await sb.from(t).insert(rows); if (error) throw new Error(`${t}: ${error.message}`); console.log(t, rows.length); };

await sb.from("games").delete().neq("id", -1);
const games = [];
let ordem = 0;
for (const g of data.games) {
  games.push({
    nome: g.nomeJogo, categoria: g.categoriaJogo, image_url: await img(g.imageUrl), icon_url: await img(g.iconUrl),
    color_bg: g.colorBgGame, porcentagem: g.porcentagem, minima: g.minima, padrao: g.padrao, maxima: g.maxima,
    link_casa: g.linkCasa, bets: g.bets ?? [], ordem: ordem++,
  });
}
await ins("games", games);

await sb.from("platforms").delete().neq("id", -1);
await ins("platforms", await Promise.all(data.platforms.map(async (p, i) => ({ nome: p.name?.trim() || null, image_url: await img(p.image), link: p.link, badge: p.badge || null, ordem: i }))));

await sb.from("slides").delete().neq("id", -1);
await ins("slides", data.slides.map((s, i) => ({ image_url: s.src, alt: s.alt, link: s.link ?? null, ordem: i })));

await sb.from("popups").delete().neq("id", -1);
await ins("popups", await Promise.all(data.popups.map(async (p, i) => ({ image_url: await img(p.image), link: p.link, ordem: i }))));

await sb.from("menu_items").delete().neq("id", -1);
await ins("menu_items", [
  ["Grupos do WhatsApp", "/grupos-whatsapp", "/icons/menu/whatsapp-icon.png"],
  ["Lançamentos Futuros", "/lancamentos-futuros", "/icons/menu/shuttle-icon.png"],
  ["Maiores Distribuições", "/maiores-distribuicoes", "/icons/menu/crown-icon.png"],
  ["Domínios Oficiais", "/dominios-oficiais", "/icons/menu/website-icon.png"],
  ["Dúvidas Frequentes", "/duvidas-frequentes", "/icons/menu/question-icon.png"],
  ["Download VPN", "/vpn", "/icons/menu/shield-icon.png"],
].map(([label, href, icon_url], i) => ({ label, href, icon_url, ordem: i })));

await sb.from("pages").upsert([
  { slug: "grupos-whatsapp", title: "Grupos do WhatsApp", content: "Entre no nosso grupo oficial para receber os sinais em primeira mão.\n\nhttps://chat.whatsapp.com/BOVTpf67qz6LRpXQK0nM6m" },
  { slug: "lancamentos-futuros", title: "Lançamentos Futuros", content: "Em breve: novos jogos e lançamentos das principais provedoras. Edite este texto no admin." },
  { slug: "dominios-oficiais", title: "Domínios Oficiais", content: "Edite este texto no admin com a lista dos seus domínios oficiais." },
  { slug: "duvidas-frequentes", title: "Dúvidas Frequentes", content: "Edite este texto no admin com as perguntas e respostas mais comuns." },
  { slug: "vpn", title: "Download VPN", content: "Edite este texto no admin com as instruções de download da VPN." },
]);

console.log("OK — seed concluído");
