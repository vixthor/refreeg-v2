create extension if not exists moddatetime schema extensions;

create table if not exists public.campaign_reports (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.api_campaigns(id) on delete cascade,
  developer_id uuid not null references auth.users(id) on delete cascade,
  api_key_id uuid references public.api_keys(id) on delete set null,
  reason text not null,
  message text not null,
  status text default 'pending' not null,
  resolution_notes text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.api_request_logs (
  id uuid primary key default uuid_generate_v4(),
  api_key_id uuid references public.api_keys(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  endpoint text not null,
  method text not null,
  mode text,
  status_code integer not null,
  error_code text,
  ip_address text,
  response_time_ms integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

drop trigger if exists handle_campaign_reports_updated_at on public.campaign_reports;
create trigger handle_campaign_reports_updated_at
before update on public.campaign_reports
for each row execute procedure moddatetime(updated_at);

alter table public.campaign_reports enable row level security;
alter table public.api_request_logs enable row level security;

create policy "Service role manages campaign reports"
  on public.campaign_reports
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role manages api request logs"
  on public.api_request_logs
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create index if not exists idx_campaign_reports_campaign_id on public.campaign_reports(campaign_id);
create index if not exists idx_campaign_reports_status on public.campaign_reports(status);
create index if not exists idx_api_request_logs_created_at on public.api_request_logs(created_at desc);
create index if not exists idx_api_request_logs_endpoint on public.api_request_logs(endpoint);
create index if not exists idx_api_request_logs_api_key_id on public.api_request_logs(api_key_id);