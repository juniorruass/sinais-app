# Sinais App

Site de sinais de slots (Next.js 16 + Supabase + Vercel) com área administrativa em `/admin`.

## Setup
1. Crie um projeto no Supabase. Rode `supabase/migrations/001_init.sql` no SQL Editor.
2. Copie `.env.example` para `.env.local` e preencha (Project Settings → API).
3. `npm i` e `node --env-file=.env.local scripts/seed.mjs` (popula jogos, plataformas, banners, popups, menu; sobe imagens).
4. Cadastre-se em `/cadastro`, depois no SQL Editor: `update profiles set role='admin' where email='SEU@EMAIL';`
5. `npm run dev` → site em `/`, admin em `/admin`.

## Deploy
Vercel: importe o repositório e configure as 3 variáveis de ambiente do `.env.example`.

## Admin (`/admin`)
Configurações (nome, logo, cores, textos, rodapé, intervalo dos sinais), Jogos, Plataformas, Banners, Popups, Menu, Páginas de conteúdo, Usuários (admin/VIP) e botão "Atualizar sinais agora".
Sinais: atualizados no banco a cada N minutos (função `refresh_signals`), exceto jogos marcados como "fixo".
