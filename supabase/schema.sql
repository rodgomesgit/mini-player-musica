-- Catálogo online do Rw Player.
-- Como usar: no painel do Supabase, abra "SQL Editor", cole este arquivo
-- inteiro, troque o e-mail na última linha pelo e-mail da conta de admin e
-- clique em "Run". Pode rodar de novo sem problema.

-- Músicas do catálogo. Os arquivos ficam nos buckets "audios" e "capas";
-- aqui guardamos só o caminho de cada um dentro do bucket.
create table if not exists public.musicas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  artista text not null,
  audio_path text not null,
  capa_path text,
  duracao real,
  criada_em timestamptz not null default now()
);

-- Quem pode subir e apagar músicas (pelo e-mail do login).
create table if not exists public.admins (
  email text primary key
);

alter table public.musicas enable row level security;
alter table public.admins enable row level security;

grant select on public.musicas to anon, authenticated;
grant insert, update, delete on public.musicas to authenticated;
grant select on public.admins to authenticated;

create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where email = auth.jwt() ->> 'email')
$$;

drop policy if exists "Todos leem o catálogo" on public.musicas;
create policy "Todos leem o catálogo" on public.musicas
  for select using (true);

drop policy if exists "Admins gerenciam o catálogo" on public.musicas;
create policy "Admins gerenciam o catálogo" on public.musicas
  for all to authenticated
  using (public.eh_admin())
  with check (public.eh_admin());

drop policy if exists "Admin vê o próprio cadastro" on public.admins;
create policy "Admin vê o próprio cadastro" on public.admins
  for select to authenticated
  using (email = auth.jwt() ->> 'email');

-- Buckets públicos: qualquer um ouve e vê as capas pelo link, só admin envia.
insert into storage.buckets (id, name, public)
values ('audios', 'audios', true), ('capas', 'capas', true)
on conflict (id) do update set public = true;

drop policy if exists "Admins veem arquivos" on storage.objects;
create policy "Admins veem arquivos" on storage.objects
  for select to authenticated
  using (bucket_id in ('audios', 'capas') and public.eh_admin());

drop policy if exists "Admins enviam arquivos" on storage.objects;
create policy "Admins enviam arquivos" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('audios', 'capas') and public.eh_admin());

drop policy if exists "Admins apagam arquivos" on storage.objects;
create policy "Admins apagam arquivos" on storage.objects
  for delete to authenticated
  using (bucket_id in ('audios', 'capas') and public.eh_admin());

-- Troque pelo e-mail que vai entrar na página de admin.
insert into public.admins (email) values ('SEU-EMAIL@exemplo.com')
on conflict (email) do nothing;
