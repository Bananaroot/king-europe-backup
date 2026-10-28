-- Eseguire una sola volta nel progetto Supabase del BACKUP.
create table if not exists public.king_wellbeing_submissions (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 consent boolean not null check(consent = true),
 name text not null default '',
 surname text not null default '',
 email text not null default '',
 report jsonb not null
);
alter table public.king_wellbeing_submissions enable row level security;
-- Nessuna policy pubblica: la funzione Edge scrive usando la chiave di servizio, custodita lato server.
-- Consultare i dati SOLO dalla dashboard Supabase con accesso autorizzato.
