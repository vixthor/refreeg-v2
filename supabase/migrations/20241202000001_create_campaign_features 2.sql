-- Create pledges table
CREATE TABLE IF NOT EXISTS public.pledges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cause_id uuid NOT NULL REFERENCES public.causes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  token text UNIQUE, -- Required for guest pledges
  amount numeric NOT NULL,
  currency text DEFAULT 'NGN',
  name text NOT NULL,
  email text NOT NULL,
  note text,
  reminder_date date NOT NULL,
  status text DEFAULT 'pending', -- pending, fulfilled, cancelled, expired
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cause_id uuid REFERENCES public.causes(id) ON DELETE CASCADE,
  paystack_subscription_code text NOT NULL,
  paystack_email_token text,
  amount numeric NOT NULL,
  interval text NOT NULL, -- 'daily', 'weekly', 'monthly'
  status text DEFAULT 'active', -- active, cancelled, past_due
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create campaign_follows table
CREATE TABLE IF NOT EXISTS public.campaign_follows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cause_id uuid NOT NULL REFERENCES public.causes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(cause_id, email)
);

-- Add new columns to causes table
ALTER TABLE public.causes
ADD COLUMN IF NOT EXISTS trust_score jsonb DEFAULT '{"impact": "B+", "readability": "A", "transparency": "High"}'::jsonb,
ADD COLUMN IF NOT EXISTS verified_status text DEFAULT 'pending', -- verified, in_review
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS multimedia text[],
ADD COLUMN IF NOT EXISTS video_links text[],
ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb;

-- Add tip_amount to donations table
ALTER TABLE public.donations
ADD COLUMN IF NOT EXISTS tip_amount numeric DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pledges_cause_id ON public.pledges(cause_id);
CREATE INDEX IF NOT EXISTS idx_pledges_email ON public.pledges(email);
CREATE INDEX IF NOT EXISTS idx_pledges_reminder_date ON public.pledges(reminder_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_follows_cause_id ON public.campaign_follows(cause_id);
CREATE INDEX IF NOT EXISTS idx_campaign_follows_email ON public.campaign_follows(email);
