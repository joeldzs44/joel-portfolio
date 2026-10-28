-- Run once in the Supabase SQL editor (Project → SQL → New query).
-- Every table has row level security enabled and no policies: only the
-- server, using the secret key, can read or write.

create table if not exists art_commits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  tag text not null check (tag in ('hire', 'collab', 'cheer', 'note')),
  name text not null default '',
  message text not null default '',
  image_path text not null,
  ip_hash text not null
);
create index if not exists art_commits_status_created on art_commits (status, created_at desc);
alter table art_commits enable row level security;

create table if not exists rate_hits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (key, window_start)
);
alter table rate_hits enable row level security;

-- Atomically counts one hit and reports whether it is within the limit.
create or replace function hit_rate_limit(p_key text, p_window_start timestamptz, p_max int)
returns boolean
language sql
security definer
set search_path = public
as $$
  insert into rate_hits as r (key, window_start, count)
  values (p_key, p_window_start, 1)
  on conflict (key, window_start) do update set count = r.count + 1
  returning count <= p_max;
$$;
revoke execute on function hit_rate_limit(text, timestamptz, int) from public, anon, authenticated;

create table if not exists interview_cache (
  key text primary key,
  answer text not null,
  profile_hash text not null,
  hits int not null default 0,
  created_at timestamptz not null default now()
);
alter table interview_cache enable row level security;

-- Storage: pending drawings are private; approved ones are public.
insert into storage.buckets (id, name, public) values ('art', 'art', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('art-public', 'art-public', true) on conflict (id) do nothing;

-- Optional housekeeping: old rate-limit windows can be deleted at any time.
-- delete from rate_hits where window_start < now() - interval '2 days';
