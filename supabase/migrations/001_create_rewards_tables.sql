-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('comment', 'share', 'donation', 'login', 'weekly_streak', 'monthly_active')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);

-- Create reward_transactions table
CREATE TABLE IF NOT EXISTS public.reward_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  transaction_type text NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reward_transactions_user_id ON public.reward_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_created_at ON public.reward_transactions(created_at);

-- Create user_wallets table
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_streak integer DEFAULT 0,
  is_monthly_active boolean DEFAULT false,
  last_active_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);

-- Create cause_shares table
CREATE TABLE IF NOT EXISTS public.cause_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cause_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cause_shares_user_id ON public.cause_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_cause_shares_cause_id ON public.cause_shares(cause_id);

-- Enable Realtime for real-time updates
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.reward_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.user_wallets REPLICA IDENTITY FULL;
ALTER TABLE public.user_streaks REPLICA IDENTITY FULL;
ALTER TABLE public.cause_shares REPLICA IDENTITY FULL;

-- Set up RLS (Row Level Security) for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Set up RLS for reward_transactions
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reward transactions" ON public.reward_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert reward transactions" ON public.reward_transactions
  FOR INSERT WITH CHECK (true);

-- Set up RLS for user_wallets
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet" ON public.user_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage wallets" ON public.user_wallets
  FOR ALL USING (true);

-- Set up RLS for user_streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streaks" ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage streaks" ON public.user_streaks
  FOR ALL USING (true);

-- Set up RLS for cause_shares
ALTER TABLE public.cause_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cause shares" ON public.cause_shares
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert shares" ON public.cause_shares
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
