-- Run this once in the Supabase SQL Editor.
-- The service role is the only application role that can access this table.
create table if not exists public.app_secrets (
  key_name text primary key,
  encrypted_value text not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.app_secrets drop constraint if exists app_secrets_key_name_check;
alter table public.app_secrets
  add constraint app_secrets_key_name_check
  check (key_name in ('openai_api_key', 'openai_api_base', 'openai_model'));

alter table public.app_secrets enable row level security;

-- No browser policies are intentionally created. API routes use the service role
-- only after verifying that the caller has the admin role.
