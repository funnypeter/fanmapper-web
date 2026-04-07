-- Wiki progress: tracks which wiki pages a user has checked off per game
create table public.wiki_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_key text not null,
  page_id integer not null,
  page_title text,
  checked_at timestamptz not null default now(),
  unique(user_id, game_key, page_id)
);

create index idx_wiki_progress_user_game on public.wiki_progress(user_id, game_key);

alter table public.wiki_progress enable row level security;

create policy "Users can view own wiki progress" on public.wiki_progress for select using (auth.uid() = user_id);
create policy "Users can insert own wiki progress" on public.wiki_progress for insert with check (auth.uid() = user_id);
create policy "Users can delete own wiki progress" on public.wiki_progress for delete using (auth.uid() = user_id);
