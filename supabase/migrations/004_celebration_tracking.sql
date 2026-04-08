-- Add column to track when user last saw their achievement celebrations
alter table public.profiles
  add column if not exists last_celebrated_at timestamptz default now();
