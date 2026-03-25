-- Migration for isolated API Donations
create table if not exists public.api_donations (
  id uuid primary key default uuid_generate_v4(),
  api_campaign_id uuid references public.api_campaigns(id) on delete cascade not null,
  amount numeric not null,
  tip_amount numeric default 0 not null,
  donor_name text not null,
  donor_email text not null,
  message text,
  is_anonymous boolean default false not null,
  status text default 'pending' not null,
  paystack_reference text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table public.api_donations enable row level security;

-- Developers can view donations made to their own API campaigns
create policy "Developers can view donations for their own API campaigns"
  on public.api_donations for select
  using (
    exists (
      select 1 from public.api_campaigns
      where id = api_donations.api_campaign_id
      and developer_id = auth.uid()
    )
  );

-- Service role can do anything (for our API routes)
-- No specific policies needed for service role as it bypasses RLS.
