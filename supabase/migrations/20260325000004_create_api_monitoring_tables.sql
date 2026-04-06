-- Monitoring table for API performance and errors
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

-- Enable RLS
alter table public.api_request_logs enable row level security;

-- Only service role and admins should manage logs
drop policy if exists "Service role manages api request logs" on public.api_request_logs;
create policy "Service role manages api request logs"
  on public.api_request_logs
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Indexes for performance
create index if not exists idx_api_request_logs_created_at on public.api_request_logs(created_at desc);
create index if not exists idx_api_request_logs_endpoint on public.api_request_logs(endpoint);
create index if not exists idx_api_request_logs_api_key_id on public.api_request_logs(api_key_id);