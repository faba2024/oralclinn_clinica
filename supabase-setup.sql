-- ============================================================
-- OralClin — estrutura de persistência no Supabase
-- Execute este arquivo inteiro no Supabase > SQL Editor.
-- ============================================================

create table if not exists public.oralclin_collection_state (
  collection text primary key,
  initialized boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.oralclin_collection_items (
  collection text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

create index if not exists oralclin_collection_items_collection_idx
  on public.oralclin_collection_items (collection);

create index if not exists oralclin_collection_items_updated_at_idx
  on public.oralclin_collection_items (collection, updated_at);

create table if not exists public.oralclin_docs (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- O app acessa estas tabelas somente no servidor usando a service role key.
-- Ativamos RLS e não concedemos políticas para anon/authenticated; assim o
-- navegador não consegue consultar diretamente pacientes, financeiro etc.
alter table public.oralclin_collection_state enable row level security;
alter table public.oralclin_collection_items enable row level security;
alter table public.oralclin_docs enable row level security;

revoke all on table public.oralclin_collection_state from anon, authenticated;
revoke all on table public.oralclin_collection_items from anon, authenticated;
revoke all on table public.oralclin_docs from anon, authenticated;

grant all on table public.oralclin_collection_state to service_role;
grant all on table public.oralclin_collection_items to service_role;
grant all on table public.oralclin_docs to service_role;

-- Força atualização do cache de esquema do PostgREST.
notify pgrst, 'reload schema';
