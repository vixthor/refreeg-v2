-- Migration to separate bank accounts from campaigns
create table if not exists public.api_bank_accounts (
  id uuid primary key default uuid_generate_v4(),
  developer_id uuid references auth.users(id) on delete cascade not null,
  bank_account_number text not null,
  bank_code text not null,
  bank_account_name text not null,
  sub_account_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  mode text default 'test' not null
);

-- Add bank_account_id to api_campaigns
alter table public.api_campaigns add column if not exists bank_account_id uuid references public.api_bank_accounts(id) on delete set null;

-- RLS for api_bank_accounts
alter table public.api_bank_accounts enable row level security;

create policy "Developers can manage their own API bank accounts"
  on public.api_bank_accounts for all
  using ( auth.uid() = developer_id );

-- Optional: Populate api_bank_accounts from existing api_campaigns to avoid data loss
-- (Only if you want to migrate existing data)
-- insert into public.api_bank_accounts (developer_id, bank_account_number, bank_code, bank_account_name, sub_account_code, mode)
-- select developer_id, bank_account_number, bank_code, bank_account_name, sub_account_code, mode from public.api_campaigns
-- on conflict do nothing;
