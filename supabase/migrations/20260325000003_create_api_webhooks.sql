-- Create api_webhooks table
CREATE TABLE IF NOT EXISTS public.api_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret TEXT NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for api_webhooks
ALTER TABLE public.api_webhooks ENABLE ROW LEVEL SECURITY;

-- Policies for api_webhooks
CREATE POLICY "Developers can view their own webhooks"
    ON public.api_webhooks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Developers can create their own webhooks"
    ON public.api_webhooks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Developers can update their own webhooks"
    ON public.api_webhooks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Developers can delete their own webhooks"
    ON public.api_webhooks FOR DELETE
    USING (auth.uid() = user_id);

-- Create api_webhook_logs table
CREATE TABLE IF NOT EXISTS public.api_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES public.api_webhooks(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    payload JSONB NOT NULL,
    status_code INTEGER,
    response_body TEXT,
    attempts INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for api_webhook_logs
ALTER TABLE public.api_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Policies for api_webhook_logs
CREATE POLICY "Developers can view logs of their own webhooks"
    ON public.api_webhook_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.api_webhooks
            WHERE id = api_webhook_logs.webhook_id
            AND user_id = auth.uid()
        )
    );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_api_webhooks_user_id ON public.api_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_api_webhook_logs_webhook_id ON public.api_webhook_logs(webhook_id);

-- Update moddatetime trigger if not already existing
-- (Assuming moddatetime extension is available as it's common in Supabase)
-- CREATE EXTENSION IF NOT EXISTS moddatetime;

-- DO $$ 
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_api_webhooks') THEN
--         CREATE TRIGGER handle_updated_at_api_webhooks
--             BEFORE UPDATE ON public.api_webhooks
--             FOR EACH ROW
--             EXECUTE FUNCTION moddatetime(updated_at);
--     END IF;
-- END $$;
