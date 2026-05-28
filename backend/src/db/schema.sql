-- ========================================================
-- Vignette.ai Database Schema (Supabase PostgreSQL)
-- ========================================================

-- Enable random uuid generator extensions
create extension if not exists "pgcrypto";

-- profiles table
-- Linked to Supabase Auth auth.users via foreign key
create table if not exists public.profiles (
  id          uuid primary key,
  created_at  timestamptz default now()
);

-- thumbnails table
-- Stores metadata of generated image outputs
create table if not exists public.thumbnails (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  video_id     text,
  title        text,
  prompt       text not null,
  prompt_ver   text not null default 'thumbnail-v1',
  image_url    text not null,
  niche        text not null,
  archetype    text not null,
  aspect_ratio text not null default '16:9',
  provider     text not null,
  created_at   timestamptz default now()
);

-- analyses table
-- Stores deep CTR critique reviews linked to thumbnails
create table if not exists public.analyses (
  id                 uuid primary key default gen_random_uuid(),
  thumbnail_id       uuid not null references public.thumbnails(id) on delete cascade,
  user_id            uuid not null references public.profiles(id) on delete cascade,
  score              integer not null,
  strengths          jsonb not null default '[]'::jsonb,
  weaknesses         jsonb not null default '[]'::jsonb,
  suggestions        jsonb not null default '[]'::jsonb,
  attention_hierarchy jsonb not null default '[]'::jsonb,
  suggested_titles   jsonb not null default '[]'::jsonb,
  created_at         timestamptz default now()
);

-- ========================================================
-- Enable Row Level Security (RLS) policies
-- ========================================================

alter table public.profiles enable row level security;
alter table public.thumbnails enable row level security;
alter table public.analyses enable row level security;

-- profiles policy
create policy "Users can retrieve their own profiles"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profiles"
  on public.profiles for update
  using (auth.uid() = id);

-- thumbnails policies
create policy "Users can insert their own thumbnails"
  on public.thumbnails for insert
  with check (auth.uid() = user_id);

create policy "Users can retrieve their own thumbnails"
  on public.thumbnails for select
  using (auth.uid() = user_id);

create policy "Users can delete their own thumbnails"
  on public.thumbnails for delete
  using (auth.uid() = user_id);

-- analyses policies
create policy "Users can insert their own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can retrieve their own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can delete their own analyses"
  on public.analyses for delete
  using (auth.uid() = user_id);

-- ========================================================
-- Trigger to auto-create profile records on user signup
-- ========================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger binding (run once inside Supabase console)
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
