// Conteúdo das páginas (copiado do original): node --env-file=.env.local scripts/seed-pages.mjs
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const CF = "https://imagedelivery.net/6tAoXewsW-UbrMK1VkE8GQ/";
const L = [
  ["777 CLUBE", "https://747win.cc/?id=586654887", "9cb804f7-182c-4e7b-e3fc-3cd6b8a62300", 0],
  ["GRUPO EK", "https://www.vaziopg.vip/?id=454265972", "1a236fb3-1796-4941-0f7a-94b1badd3e00", 0],
  ["EQUIPE 777", "https://desenhar777.co/?id=847070480", "52ed68cc-dcf1-4bd4-bc59-d8f31170e300", 0],
  ["GRUPO WE", "https://d2dbhlgwm0elwm.cloudfront.net/?id=237296610", "ecfc5188-9a19-447d-3e72-4ae080dde900", 0],
  ["888 EQUIPE", "", "d78ba6c8-d6bf-4d7f-c56b-cb4c9578ad00", 12.4],
  ["GRUPO ANJO", "", "c7eca0b3-4250-4311-c5bb-e33dcf7b8b00", 15.6],
  ["GRUPO VOY", "", "3d6f0010-985b-4029-64aa-1ba2ba2f8f00", 17.5],
  ["GRUPO 91", "", "700f8718-2f1f-424a-e239-9f485d3b4900", 39],
  ["GRUPO DY", "", "26ef7b21-519f-4360-8444-9c8986fba300", 44],
  ["GRUPO DZ", "", "5c10d329-8f71-49c5-bd2b-afec085dd000", 63],
  ["GRUPO W1", "", "a2f97384-b5fb-4424-afe0-d8395383f500", 65],
  ["GRUPO XW", "", "e9b9a90a-2146-4491-8da6-2e19efa77300", 110],
];
const lines = [];
for (const [nome, link, id, h] of L) {
  const r = await fetch(CF + id + "/public");
  const buf = Buffer.from(await r.arrayBuffer());
  const type = r.headers.get("content-type") || "image/png";
  const ext = type.split("/")[1].split(";")[0];
  const p = `lancamentos/${id}.${ext}`;
  const { error } = await sb.storage.from("media").upload(p, buf, { contentType: type, upsert: true });
  if (error) throw new Error(error.message);
  const url = sb.storage.from("media").getPublicUrl(p).data.publicUrl;
  const when = h ? new Date(Date.now() + h * 3600_000 - 3 * 3600_000).toISOString().slice(0, 16).replace("T", " ") : "agora";
  lines.push([nome, link, url, when].join(" | "));
}
const pages = {
  "grupos-whatsapp": ["Grupos do WhatsApp", [
    "GRUPO 2 | https://chat.whatsapp.com/FgLTUlsxmoL05SnlPUWBQW?s=cl&p=i&mlu=4&ilr=4&iam=2",
    "GRUPO 3 | https://chat.whatsapp.com/BOVTpf67qz6LRpXQK0nM6m?s=cl&p=i&iam=2",
    "GRUPO 4 | https://chat.whatsapp.com/E6kPsiGKbdF20ggUH3KHt5?s=cl&p=i&iam=2"].join("\n")],
  "lancamentos-futuros": ["Lançamentos Futuros", lines.join("\n")],
  "dominios-oficiais": ["Domínios Oficiais", [
    ""].join("\n")],
  "duvidas-frequentes": ["Dúvidas Frequentes", [
    "Como acessar jogos da Pragmatic? | Acesse a categoria Pragmatic na barra de categorias da página inicial para ver todos os jogos com sinais atualizados.",
    "Como acessar jogos da PG SOFT? | Acesse a categoria PG Soft na barra de categorias da página inicial para ver todos os jogos com sinais atualizados.",
    "Como acessar jogos da Tada? | Acesse a categoria Tada Gaming na barra de categorias da página inicial para ver todos os jogos com sinais atualizados."].join("\n")],
  vpn: ["Download VPN", [
    "DOWNLOAD SEGURO! | https://play.google.com/store/apps/details?id=com.cloudflare.onedotonedotonedotone",
    "INICIE O DOWNLOAD | Clique no botão Download Seguro para baixar a VPN recomendada",
    "INSTALE O APLICATIVO | Você será direcionado para a loja Oficial do seu dispositivo",
    "FINALIZE A CONFIGURAÇÃO | Abra o aplicativo e permita os acessos necessários para funcionamento",
    "ATIVE SUA CONEXÃO | Toque em \"Conectar\" para ligar a proteção da nossa VPN",
    "ENTRE NO SITE DE SINAIS | Com a VPN ativa, acesse nosso APP normalmente 100% seguro"].join("\n")],
};
const { error } = await sb.from("pages").upsert(Object.entries(pages).map(([slug, [title, content]]) => ({ slug, title, content, ativo: true })));
if (error) throw new Error(error.message);
console.log("OK", lines.length);
