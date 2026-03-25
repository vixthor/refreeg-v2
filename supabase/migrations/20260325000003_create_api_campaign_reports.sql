-- Migration: Create api_campaign_reports table
-- Description: Stores reports filed against API campaigns for abuse, fraud, etc.

CREATE TABLE public.api_campaign_reports (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  api_campaign_id uuid NOT NULL,
  reason text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.api_campaign_reports
  ADD CONSTRAINT api_campaign_reports_pkey PRIMARY KEY (id);

ALTER TABLE public.api_campaign_reports
  ADD CONSTRAINT api_campaign_reports_api_campaign_id_fkey FOREIGN KEY (api_campaign_id) REFERENCES public.api_campaigns(id) ON DELETE CASCADE;

CREATE INDEX idx_api_campaign_reports_campaign_id ON public.api_campaign_reports USING btree (api_campaign_id);
CREATE INDEX idx_api_campaign_reports_status ON public.api_campaign_reports USING btree (status);

-- Enable RLS
ALTER TABLE public.api_campaign_reports ENABLE ROW LEVEL SECURITY;

-- Service Role has full access bypasses RLS generally, but we'll add policies if needed.
-- We want anyone to be able to insert a report (since it's a public API endpoint).
CREATE POLICY "Enable insert for anonymous users" ON public.api_campaign_reports
  FOR INSERT
  WITH CHECK (true);

-- We want admins to be able to view and update reports. Since admin dashboard is typically secured at the application layer or uses service role, this is fine. 
-- For developers to view reports for their campaigns, we'll enforce this at the API layer (server route) using validateApiKey, which runs as service_role.

-- Function to handle timestamp updates
CREATE TRIGGER handle_api_campaign_reports_updated_at
  BEFORE UPDATE ON public.api_campaign_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
