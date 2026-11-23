-- Sinais App: schema inicial
create extension if not exists pgcrypto;

-- ============ CONFIGURAÇÕES (chave/valor editável no admin) ============
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  label text,
  grupo text default 'geral',
  tipo text default 'text',      -- text | textarea | color | image | number | bool
  ordem int default 0
);

-- ============ PERFIS ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text not null default 'user',   -- user | admin
  is_vip boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ JOGOS ============
create table if not exists public.games (
  id serial primary key,
  nome text not null,
  categoria text not null check (categoria in ('PG','PP','WG','TADA')),
  image_url text,
  icon_url text,
  color_bg text default 'rgb(30,30,30)',
  porcentagem int not null default 80,
  minima int not null default 50,
  padrao int not null default 50,
  maxima int not null default 50,
  link_casa text,
  bets text[] not null default '{}',
  fixo boolean not null default false,   -- true = não sofre atualização automática dos sinais
  ativo boolean not null default true,
  ordem int not null default 0,
  updated_at timestamptz not null default now()
);

-- ============ PLATAFORMAS, BANNERS, POPUPS, MENU ============
create table if not exists public.platforms (
  id serial primary key,
  nome text, image_url text, link text, badge text,
  ativo boolean not null default true, ordem int not null default 0
);
create table if not exists public.slides (
  id serial primary key,
  image_url text not null, alt text, link text,
  ativo boolean not null default true, ordem int not null default 0
);
create table if not exists public.popups (
  id serial primary key,
  image_url text not null, link text,
  ativo boolean not null default true, ordem int not null default 0
);
create table if not exists public.menu_items (
  id serial primary key,
  label text not null, href text not null, icon_url text,
  externo boolean not null default false,
  ativo boolean not null default true, ordem int not null default 0
);
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id int not null references public.games(id) on delete cascade,
  primary key (user_id, game_id)
);

-- ============ RLS ============
alter table public.site_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.platforms enable row level security;
alter table public.slides enable row level security;
alter table public.popups enable row level security;
alter table public.menu_items enable row level security;
alter table public.favorites enable row level security;

do $$ declare t text; begin
  foreach t in array array['site_settings','games','platforms','slides','popups','menu_items'] loop
    execute format('drop policy if exists "read_%1$s" on public.%1$s', t);
    execute format('create policy "read_%1$s" on public.%1$s for select using (true)', t);
    execute format('drop policy if exists "admin_%1$s" on public.%1$s', t);
    execute format('create policy "admin_%1$s" on public.%1$s for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "profile_self" on public.profiles;
create policy "profile_self" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profile_self_update" on public.profiles;
create policy "profile_self_update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
drop policy if exists "profile_admin" on public.profiles;
create policy "profile_admin" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "fav_own" on public.favorites;
create policy "fav_own" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============ ATUALIZAÇÃO AUTOMÁTICA DOS SINAIS (a cada N minutos) ============
-- Chamada pelo site a cada visita; só executa se o "slot" de tempo mudou. Atômico (sem corrida).
create or replace function public.refresh_signals() returns bigint
language plpgsql security definer set search_path = public as $$
declare
  v_interval int := coalesce(nullif((select value from site_settings where key='signals_interval_min'),'')::int, 5);
  v_auto text := coalesce((select value from site_settings where key='signals_auto'),'true');
  v_slot bigint := floor(extract(epoch from now()) / (v_interval*60));
  v_old bigint;
begin
  if v_auto <> 'true' then
    return coalesce(nullif((select value from site_settings where key='signals_slot'),'')::bigint, v_slot);
  end if;
  update site_settings set value = v_slot::text
    where key='signals_slot' and coalesce(nullif(value,'')::bigint,0) <> v_slot
    returning 1 into v_old;
  if found then
    update games set
      porcentagem = 60 + floor(random()*40)::int,
      minima = 5 + floor(random()*94)::int,
      padrao = 5 + floor(random()*94)::int,
      maxima = 5 + floor(random()*94)::int,
      updated_at = now()
    where fixo = false and ativo = true;
  end if;
  return v_slot;
end $$;
grant execute on function public.refresh_signals() to anon, authenticated;

-- ============ STORAGE (imagens do admin) ============
insert into storage.buckets (id, name, public) values ('media','media',true) on conflict (id) do nothing;
drop policy if exists "media_read" on storage.objects;
create policy "media_read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media_admin" on storage.objects;
create policy "media_admin" on storage.objects for all using (bucket_id='media' and public.is_admin()) with check (bucket_id='media' and public.is_admin());

-- ============ PÁGINAS DE CONTEÚDO (FAQ, domínios oficiais, etc.) ============
create table if not exists public.pages (
  slug text primary key,
  title text not null,
  content text not null default '',
  ativo boolean not null default true
);
alter table public.pages enable row level security;
drop policy if exists "read_pages" on public.pages;
create policy "read_pages" on public.pages for select using (true);
drop policy if exists "admin_pages" on public.pages;
create policy "admin_pages" on public.pages for all using (public.is_admin()) with check (public.is_admin());
