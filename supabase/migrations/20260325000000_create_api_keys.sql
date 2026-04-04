CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL UNIQUE,
  key_hash TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('live', 'test')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Allow users to read, update, delete their own keys
CREATE POLICY "Users can view their own API keys"
ON public.api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys"
ON public.api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
ON public.api_keys FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
ON public.api_keys FOR DELETE
USING (auth.uid() = user_id);

-- Ensure only authenticated users can access the table at all
-- Assuming policies are only checked for authenticated users by default in Supabase depending on role assignment,
-- but explicitly relying on auth.uid() ensures safety.
