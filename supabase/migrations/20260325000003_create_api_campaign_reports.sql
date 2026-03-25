-- Ensure uuid-ossp is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Base table
CREATE TABLE IF NOT EXISTS public.api_campaign_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_campaign_id UUID NOT NULL REFERENCES public.api_campaigns(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns if they don't exist (Migration from Phase 5 to Phase 9)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_campaign_reports' AND column_name = 'developer_id') THEN
        ALTER TABLE public.api_campaign_reports ADD COLUMN developer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        -- NOTE: We allow NULL for existing rows during migration, but ideally it should be NOT NULL.
        -- Update existing rows based on campaign owner if possible
        UPDATE public.api_campaign_reports r SET developer_id = c.developer_id FROM public.api_campaigns c WHERE r.api_campaign_id = c.id;
        ALTER TABLE public.api_campaign_reports ALTER COLUMN developer_id SET NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_campaign_reports' AND column_name = 'api_key_id') THEN
        ALTER TABLE public.api_campaign_reports ADD COLUMN api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_campaign_reports' AND column_name = 'resolution_notes') THEN
        ALTER TABLE public.api_campaign_reports ADD COLUMN resolution_notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_campaign_reports' AND column_name = 'resolved_at') THEN
        ALTER TABLE public.api_campaign_reports ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.api_campaign_reports ENABLE ROW LEVEL SECURITY;

-- Service role bypass - Recreate safely
DROP POLICY IF EXISTS "Service role manages api campaign reports" ON public.api_campaign_reports;
CREATE POLICY "Service role manages api campaign reports"
  ON public.api_campaign_reports
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create set_updated_at helper if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS handle_api_campaign_reports_updated_at ON public.api_campaign_reports;
CREATE TRIGGER handle_api_campaign_reports_updated_at
BEFORE UPDATE ON public.api_campaign_reports
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_campaign_reports_api_campaign_id ON public.api_campaign_reports(api_campaign_id);
CREATE INDEX IF NOT EXISTS idx_api_campaign_reports_status ON public.api_campaign_reports(status);
CREATE INDEX IF NOT EXISTS idx_api_campaign_reports_developer_id ON public.api_campaign_reports(developer_id);
