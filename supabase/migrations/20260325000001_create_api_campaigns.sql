-- Migration for isolated API Campaigns
create extension if not exists moddatetime schema extensions;

create table if not exists public.api_campaigns (
  id uuid primary key default uuid_generate_v4(),
  developer_id uuid references auth.users(id) on delete cascade not null,
  api_key_id uuid references public.api_keys(id) on delete set null,
  title text not null,
  description text not null,
  goal_amount numeric not null,
  raised_amount numeric default 0 not null,
  currency text default 'NGN' not null,
  status text default 'active' not null,
  payout_mode text not null,
  deadline timestamp with time zone,
  bank_account_number text not null,
  bank_code text not null,
  bank_account_name text not null,
  sub_account_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  mode text default 'test' not null
);

-- Trigger to set updated_at
create trigger handle_updated_at before update on public.api_campaigns
  for each row execute procedure moddatetime (updated_at);

-- Row Level Security
alter table public.api_campaigns enable row level security;

-- Developers can view their own campaigns via dashboard/admin (Service role bypasses this in API)
create policy "Developers can view their own API campaigns"
  on public.api_campaigns for select
  using ( auth.uid() = developer_id );

create policy "Developers can insert their own API campaigns"
  on public.api_campaigns for insert
  with check ( auth.uid() = developer_id );

create policy "Developers can update their own API campaigns"
  on public.api_campaigns for update
  using ( auth.uid() = developer_id );
