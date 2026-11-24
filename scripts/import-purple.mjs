// Importa capas/jogos da Purple: node --env-file=.env.local scripts/import-purple.mjs "C:/caminho/purple1409.online"
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
const root = process.argv[2];
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const lista = JSON.parse(fs.readFileSync(path.join(root, "api/jogos/lista.json"), "utf8"));
const { data: existing } = await sb.from("games").select("*");
const have = new Set(existing.map((g) => g.categoria + ":" + norm(g.nome)));
const byCat = (c) => existing.filter((g) => g.categoria === c);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
let ordem = Math.max(...existing.map((g) => g.ordem)) + 1;
const types = { png: "image/png", avif: "image/avif", webp: "image/webp", jpg: "image/jpeg" };
const upload = async (key, buf, ext) => {
  const p = `purple/${key}.${ext}`;
  const { error } = await sb.storage.from("media").upload(p, buf, { contentType: types[ext], upsert: true });
  if (error) throw new Error(p + ": " + error.message);
  return sb.storage.from("media").getPublicUrl(p).data.publicUrl;
};
const rows = [];
async function add(cat, nome, key, buf, ext) {
  if (have.has(cat + ":" + norm(nome))) return;
  have.add(cat + ":" + norm(nome));
  const ref = byCat(cat);
  const url = await upload(key, buf, ext);
  const rnd = () => 5 + Math.floor(Math.random() * 94);
  rows.push({ nome, categoria: cat, image_url: url, icon_url: url, color_bg: pick(ref).color_bg, porcentagem: 60 + Math.floor(Math.random() * 40),
    minima: rnd(), padrao: rnd(), maxima: rnd(), link_casa: pick(ref).link_casa, bets: pick(ref).bets, ordem: ordem++ });
}
const provCat = { "200": "PG", "301": "PP" };
const base = path.join(root, "game_pictures/g/EA");
for (const prov of Object.keys(provCat)) {
  for (const sub of fs.readdirSync(path.join(base, prov))) {
    const dir = path.join(base, prov, sub);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const id of fs.readdirSync(dir)) {
      const nome = lista[id]; const gd = path.join(dir, id);
      if (!nome || !fs.statSync(gd).isDirectory()) continue;
      const f = ["default.png", "default.avif", "default.webp"].find((x) => fs.existsSync(path.join(gd, x)));
      if (!f) continue;
      await add(provCat[prov], nome, id, fs.readFileSync(path.join(gd, f)), f.split(".")[1]);
    }
  }
}
// WG (banners remotos do igamewin)
const wg = JSON.parse(fs.readFileSync(path.join(root, "tmp_wg_gamelist.json"), "utf8")).games ?? [];
for (const g of wg) {
  if (have.has("WG:" + norm(g.game_name))) continue;
  try { const r = await fetch(g.banner); if (!r.ok) continue; await add("WG", g.game_name, g.game_code, Buffer.from(await r.arrayBuffer()), g.banner.split(".").pop()); } catch {}
}
for (let i = 0; i < rows.length; i += 50) {
  const { error } = await sb.from("games").insert(rows.slice(i, i + 50));
  if (error) throw new Error(error.message);
}
console.log("adicionados:", rows.length, Object.entries(rows.reduce((a, r) => (a[r.categoria] = (a[r.categoria] || 0) + 1, a), {})));
