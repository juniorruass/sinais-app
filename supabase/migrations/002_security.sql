-- Endurecimento de segurança (rodar no SQL Editor)
-- 1) Usuário comum NÃO pode alterar o próprio perfil (impedia auto-promoção a VIP).
drop policy if exists "profile_self_update" on public.profiles;
revoke update, insert, delete on public.profiles from anon, authenticated;
-- 2) O admin usa a service role (servidor); remove escrita direta dos usuários do site nas tabelas de conteúdo.
revoke insert, update, delete on public.site_settings, public.games, public.platforms, public.slides, public.popups, public.menu_items, public.pages from anon, authenticated;
-- 3) anon não precisa ler perfis nem favoritos.
revoke all on public.profiles, public.favorites from anon;
-- 4) Storage: remove escrita pública/de usuário no bucket media (upload é feito pelo servidor).
drop policy if exists "media_admin" on storage.objects;
-- 5) Coluna do peso dos popups (se ainda não existir)
alter table public.popups add column if not exists peso int not null default 1;
