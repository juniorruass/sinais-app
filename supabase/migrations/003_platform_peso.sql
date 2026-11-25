-- Peso de cada plataforma na distribuicao dos jogos (admin escolhe quem recebe mais)
alter table public.platforms add column if not exists peso int not null default 1;
