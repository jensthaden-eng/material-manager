-- Trommel App PIN login schema additions
alter table public.profiles
  add column if not exists pin_hash text,
  add column if not exists pin_salt text,
  add column if not exists pin_initialized boolean not null default false;

-- Set APP_START_PIN as an Edge Function secret, not in this SQL or frontend.
-- Four-digit PINs require rate limiting before production use.
