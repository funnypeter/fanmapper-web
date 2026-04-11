-- TV Shows table (cached from TVDB)
create table public.tv_shows (
  id text primary key,
  tvdb_id integer unique,
  title text not null,
  poster_url text,
  genres jsonb default '[]',
  network text,
  release_date text,
  summary text,
  created_at timestamptz not null default now()
);

-- User's TV show library
create table public.user_shows (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  show_id text not null references public.tv_shows(id),
  status text not null default 'backlog' check (status in ('watching', 'completed', 'dropped', 'wishlist', 'backlog')),
  rating integer check (rating between 1 and 5),
  review text,
  current_season integer not null default 1,
  current_episode integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, show_id)
);

-- TV wiki/episode progress tracking
create table public.tv_wiki_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  show_key text not null,
  page_id text not null,
  page_title text,
  checked_at timestamptz not null default now(),
  unique(user_id, show_key, page_id)
);

-- Indexes
create index idx_user_shows_user on public.user_shows(user_id);
create index idx_user_shows_status on public.user_shows(user_id, status);
create index idx_tv_wiki_progress_user on public.tv_wiki_progress(user_id, show_key);

-- RLS
alter table public.tv_shows enable row level security;
alter table public.user_shows enable row level security;
alter table public.tv_wiki_progress enable row level security;

-- TV shows: anyone can read, inserts allowed (for caching)
create policy "TV shows readable by all" on public.tv_shows for select using (true);
create policy "TV shows insertable" on public.tv_shows for insert with check (true);

-- User shows: users can CRUD only their own
create policy "Users can view own shows" on public.user_shows for select using (auth.uid() = user_id);
create policy "Users can add shows" on public.user_shows for insert with check (auth.uid() = user_id);
create policy "Users can update own shows" on public.user_shows for update using (auth.uid() = user_id);
create policy "Users can delete own shows" on public.user_shows for delete using (auth.uid() = user_id);

-- TV wiki progress: users can CRUD only their own
create policy "Users can view own tv progress" on public.tv_wiki_progress for select using (auth.uid() = user_id);
create policy "Users can add tv progress" on public.tv_wiki_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own tv progress" on public.tv_wiki_progress for update using (auth.uid() = user_id);
create policy "Users can delete own tv progress" on public.tv_wiki_progress for delete using (auth.uid() = user_id);
