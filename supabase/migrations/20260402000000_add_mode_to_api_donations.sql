-- Add mode column to api_donations for test/live data isolation
-- This mirrors the existing mode columns on api_campaigns and api_bank_accounts

alter table public.api_donations 
  add column if not exists mode text default 'live' not null;

-- Backfill: mark all existing donations as 'live' (already done by default)
-- Index for efficient mode filtering
create index if not exists idx_api_donations_mode on public.api_donations(mode);

-- Also add a combined index for campaign + mode lookups
create index if not exists idx_api_donations_campaign_mode 
  on public.api_donations(api_campaign_id, mode);
