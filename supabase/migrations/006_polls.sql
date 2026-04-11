-- Polls table: stores generated poll questions
create table public.polls (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  options jsonb not null,
  image_url text,
  game_hint text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Poll votes: one vote per user per poll
create table public.poll_votes (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  selected_option int not null,
  created_at timestamptz not null default now(),
  unique(poll_id, user_id)
);

-- Indexes
create index idx_polls_expires on public.polls(expires_at);
create index idx_poll_votes_poll on public.poll_votes(poll_id);
create index idx_poll_votes_user on public.poll_votes(user_id);

-- RLS
alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;

create policy "Polls readable by all" on public.polls for select using (true);
create policy "Polls insertable by server" on public.polls for insert with check (true);

create policy "Votes readable by all" on public.poll_votes for select using (true);
create policy "Users can insert own vote" on public.poll_votes for insert with check (auth.uid() = user_id);
create policy "Users can update own vote" on public.poll_votes for update using (auth.uid() = user_id);
