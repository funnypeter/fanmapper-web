-- Add category column to polls to separate gaming vs TV polls
alter table public.polls add column if not exists category text not null default 'gaming';

-- Index for filtering by category
create index if not exists idx_polls_category on public.polls(category);
