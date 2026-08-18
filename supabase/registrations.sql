-- Run this in the Supabase dashboard → SQL Editor.
-- Stores one row per app form submission, tied to the family's account.

create table if not exists public.registrations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  email      text not null,                      -- the verified account email
  type       text not null,                      -- 'connect' | 'prayer' | 'pno' | 'camp'
  title      text not null,                      -- what they signed up for
  details    jsonb not null default '{}'::jsonb, -- the rest of the form fields
  created_at timestamptz not null default now()
);

create index if not exists registrations_user_idx on public.registrations (user_id);

-- Row-level security: a signed-in user can read ONLY their own registrations.
alter table public.registrations enable row level security;

drop policy if exists "read own registrations" on public.registrations;
create policy "read own registrations"
  on public.registrations for select
  to authenticated
  using (auth.uid() = user_id);

-- Inserts are performed server-side by the Cloudflare Worker using the
-- service_role key (which bypasses RLS). There is intentionally no client
-- insert policy, so submissions can only be created through the Worker.
