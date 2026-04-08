-- Track when user's Steam library was last auto-synced
alter table public.profiles
  add column if not exists last_steam_sync_at timestamptz;
