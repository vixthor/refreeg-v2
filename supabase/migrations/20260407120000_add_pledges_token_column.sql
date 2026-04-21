-- Guest pledge checkout uses `token` for Paystack initialize when user_id is null.
-- Older databases may have been created without this column.
ALTER TABLE public.pledges
  ADD COLUMN IF NOT EXISTS token text;

-- One token per guest pledge; multiple NULLs allowed for logged-in users.
CREATE UNIQUE INDEX IF NOT EXISTS idx_pledges_token_unique
  ON public.pledges (token)
  WHERE token IS NOT NULL;
