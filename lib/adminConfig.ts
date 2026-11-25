export type Field = {
  name: string; label: string;
  type: "text" | "number" | "bool" | "image" | "textarea" | "select" | "color" | "list";
  options?: string[]; hint?: string; wide?: boolean;
};
export type Resource = { table: string; title: string; singular: string; fields: Field[]; summary: (r: Record<string, unknown>) => string; pk?: string };

const common: Field[] = [
  { name: "ordem", label: "Ordem", type: "number" },
  { name: "ativo", label: "Ativo", type: "bool" },
];

export const RESOURCES: Record<string, Resource> = {
  jogos: {
    table: "games", title: "Jogos", singular: "jogo",
    summary: (r) => `${r.nome} · ${r.categoria} · ${r.porcentagem}%${r.fixo ? " · 🔒 fixo" : ""}`,
    fields: [
      { name: "nome", label: "Nome do jogo", type: "text" },
      { name: "categoria", label: "Categoria", type: "select", options: ["PG", "PP", "WG", "TADA"] },
      { name: "image_url", label: "Imagem de capa", type: "image" },
      { name: "icon_url", label: "Ícone", type: "image" },
      { name: "color_bg", label: "Cor de fundo do card", type: "text", hint: "ex: rgb(237, 82, 68) ou #ed5244" },
      { name: "porcentagem", label: "Distribuição %", type: "number" },
      { name: "minima", label: "Aposta Mínima %", type: "number" },
      { name: "padrao", label: "Aposta Padrão %", type: "number" },
      { name: "maxima", label: "Aposta Máxima %", type: "number" },
      { name: "link_casa", label: "Link próprio deste jogo (deixe VAZIO para usar a plataforma indicada)", type: "text", wide: true },
      { name: "bets", label: "Lista de apostas (uma por linha, ex: 0,40)", type: "list", wide: true, hint: "Define as faixas Mínima/Padrão/Máxima mostradas no card" },
      { name: "fixo", label: "Fixo (não muda na atualização automática)", type: "bool" },
      ...common,
    ],
  },
  plataformas: {
    table: "platforms", title: "Plataformas indicadas", singular: "plataforma",
    summary: (r) => `${r.nome ?? "(sem nome)"} (peso ${r.peso ?? 1}) → ${r.link}`,
    fields: [
      { name: "nome", label: "Nome", type: "text" },
      { name: "image_url", label: "Logo", type: "image" },
      { name: "link", label: "Link", type: "text", wide: true },
      { name: "badge", label: "Selo (ex: Nova)", type: "text" },
      { name: "peso", label: "Peso dos jogos que vão para esta plataforma (1 = normal, 3 = 3x mais, 0 = nenhum jogo)", type: "number", hint: "Cada jogo sorteia uma plataforma ativa, proporcional ao peso. Ex.: A = 3 e B = 1 → 75% dos jogos vão para A e 25% para B." },
      ...common,
    ],
  },
  banners: {
    table: "slides", title: "Banners da home", singular: "banner",
    summary: (r) => `${r.alt ?? "Banner"} → ${r.link || "sem link"}`,
    fields: [
      { name: "image_url", label: "Imagem (1920x1080)", type: "image" },
      { name: "alt", label: "Texto alternativo", type: "text" },
      { name: "link", label: "Link ao clicar", type: "text", wide: true },
      ...common,
    ],
  },
  popups: {
    table: "popups", title: "Popups", singular: "popup",
    summary: (r) => `Popup (peso ${r.peso ?? 1}) → ${r.link || "sem link"}`,
    fields: [
      { name: "image_url", label: "Imagem (vertical)", type: "image" },
      { name: "link", label: "Link", type: "text", wide: true },
      { name: "peso", label: "Chance de aparecer (peso: 1 = normal, 3 = 3x mais, 0 = nunca)", type: "number" },
      ...common,
    ],
  },
  menu: {
    table: "menu_items", title: "Itens do menu", singular: "item de menu",
    summary: (r) => `${r.label} → ${r.href}`,
    fields: [
      { name: "label", label: "Texto", type: "text" },
      { name: "href", label: "Link (ex: /duvidas-frequentes ou https://...)", type: "text", wide: true },
      { name: "icon_url", label: "Ícone", type: "image" },
      { name: "externo", label: "Abrir em nova aba", type: "bool" },
      ...common,
    ],
  },
  paginas: {
    table: "pages", title: "Páginas de conteúdo", singular: "página", pk: "slug",
    summary: (r) => `/${r.slug} · ${r.title}`,
    fields: [
      { name: "slug", label: "Endereço (slug, ex: duvidas-frequentes)", type: "text" },
      { name: "title", label: "Título", type: "text" },
      { name: "content", label: "Conteúdo (uma linha por item, campos separados por |)", type: "textarea", wide: true, hint: "grupos-whatsapp: Nome | link  ·  lancamentos-futuros: Nome | link | imagem | AAAA-MM-DD HH:MM (ou: agora)  ·  dominios-oficiais: .BET | www.site.bet | online/offline  ·  duvidas-frequentes: Pergunta | Resposta  ·  vpn: 1ª linha: Botão | link, depois Passo | descrição" },
      { name: "ativo", label: "Ativa", type: "bool" },
    ],
  },
};

export const SETTING_GROUPS: { grupo: string; items: Field[] }[] = [
  { grupo: "Capas das seções", items: [
    { name: "cover_pg", label: "Capa PG Soft", type: "image", wide: true },
    { name: "cover_pp", label: "Capa Pragmatic Play", type: "image", wide: true },
    { name: "cover_wg", label: "Capa WG Games", type: "image", wide: true },
    { name: "cover_tada", label: "Capa Tada Gaming", type: "image", wide: true },
  ] },
  { grupo: "Marca", items: [
    { name: "brand_name", label: "Nome da marca", type: "text" },
    { name: "site_title", label: "Título do site (aba do navegador)", type: "text" },
    { name: "site_description", label: "Descrição (SEO)", type: "textarea", wide: true },
    { name: "site_domain", label: "Domínio do site (deixe \"auto\" para usar o domínio de acesso automaticamente)", type: "text" },
    { name: "logo_url", label: "Logo", type: "image" },
    { name: "favicon_url", label: "Favicon", type: "image" },
  ]},
  { grupo: "Cores", items: [
    { name: "color_primary", label: "Cor primária (botões)", type: "color" },
    { name: "color_gradient_start", label: "Gradiente — início", type: "color" },
    { name: "color_gradient_end", label: "Gradiente — fim", type: "color" },
    { name: "color_secondary", label: "Cor secundária", type: "color" },
  ]},
  { grupo: "Textos da home", items: [
    { name: "platforms_title", label: "Título das plataformas", type: "text" },
    { name: "platforms_subtitle", label: "Subtítulo das plataformas", type: "text", wide: true },
    { name: "distributions_title", label: "Título das distribuições", type: "text" },
    { name: "search_placeholder", label: "Texto da busca", type: "text" },
  ]},
  { grupo: "Rodapé", items: [
    { name: "footer_resp_title", label: "Jogo responsável — título", type: "text" },
    { name: "footer_resp_highlight", label: "Jogo responsável — destaque", type: "text" },
    { name: "footer_resp_text", label: "Jogo responsável — texto ({brand} = nome da marca)", type: "textarea", wide: true },
    { name: "footer_legal_title", label: "Aviso legal — título", type: "text" },
    { name: "footer_legal_text", label: "Aviso legal — texto ({domain} = domínio)", type: "textarea", wide: true },
    { name: "footer_18_text", label: "Texto +18", type: "textarea", wide: true },
  ]},
  { grupo: "Sinais e popup", items: [
    { name: "signals_auto", label: "Atualizar sinais automaticamente (true/false)", type: "text" },
    { name: "signals_interval_min", label: "Intervalo de atualização (minutos)", type: "number" },
    { name: "popup_hours", label: "Horas sem mostrar popup após fechar", type: "number" },
  ]},
];
