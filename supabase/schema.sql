-- Pāka · Supabase Schema
-- Run this in Supabase SQL Editor

-- Recipe stats (aggregate counters)
create table if not exists recipe_stats (
  recipe_id   text primary key,
  likes       int  not null default 0,
  loves       int  not null default 0,
  saves       int  not null default 0,
  views       int  not null default 0,
  updated_at  timestamptz default now()
);

-- Per-session interactions (prevents double-clicking)
create table if not exists user_interactions (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  recipe_id   text not null,
  type        text not null check (type in ('like','love','save')),
  created_at  timestamptz default now(),
  unique (session_id, recipe_id, type)
);

-- Recipe suggestions from users
create table if not exists suggestions (
  id          uuid primary key default gen_random_uuid(),
  text        text not null,
  created_at  timestamptz default now()
);

-- Admin-uploaded recipe photos
create table if not exists recipe_photos (
  recipe_id   text primary key,
  url         text not null,
  uploaded_at timestamptz default now()
);

-- Seed recipe_stats rows for all known recipe IDs
insert into recipe_stats (recipe_id) values
  ('poha'),('upma'),('rajma'),('biryani'),('pulao'),
  ('samai-upma'),('uggani'),('uppudu-pindi'),('butter-paneer'),
  ('paneer-tikka-masala'),('chole'),('dal-tadka'),('pongal'),('khichdi'),
  ('rasoi-paneer-tikka'),('rasoi-butter-chicken'),('rasoi-chole'),
  ('mango-dal'),('dosakai-dal'),('palak-dal'),('gongura-dal'),
  ('pappu-pulusu'),('bacchali-dal'),('methi-dal'),('sambar'),
  ('idly'),('dosa'),('uttapam'),('broccoli-garlic'),('broccoli-besan'),
  ('pesarattu'),('gongura-chicken'),('natu-kodi-pulusu'),
  ('gutti-vankaya'),('egg-curry'),
  ('rasoi-dal-makhani'),('rasoi-pav-bhaji'),('rasoi-kadai-paneer')
on conflict do nothing;

-- Enable Row Level Security (public read, service-role write)
alter table recipe_stats       enable row level security;
alter table user_interactions  enable row level security;
alter table suggestions        enable row level security;
alter table recipe_photos      enable row level security;

create policy "Public read stats"        on recipe_stats      for select using (true);
create policy "Public read photos"       on recipe_photos     for select using (true);
create policy "Service role all"         on recipe_stats      for all    using (true);
create policy "Service role interactions" on user_interactions for all   using (true);
create policy "Service role suggestions" on suggestions        for all   using (true);
create policy "Service role photos"      on recipe_photos      for all   using (true);
