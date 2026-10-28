-- Eseguire nell’SQL Editor del progetto Supabase, UNA SOLA VOLTA.
create table if not exists public.king_test_clienti (
 id bigint generated always as identity primary key,
 created_at timestamptz not null default now(),
 nome text not null,
 cognome text not null,
 email text not null,
 punteggi jsonb not null,
 data_test timestamptz not null,
 consenso boolean not null check (consenso),
 tipo_test text not null default 'king-benessere'
);
alter table public.king_test_clienti enable row level security;
revoke all on public.king_test_clienti from anon, authenticated;
create index if not exists king_test_clienti_data on public.king_test_clienti(created_at desc);
-- Lettura/scrittura solo via service role sulla Edge Function, NON da JS pubblico.
