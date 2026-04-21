-- Paystack authorization + scheduled pledge charge support
ALTER TABLE public.pledges
  ADD COLUMN IF NOT EXISTS paystack_authorization_code text,
  ADD COLUMN IF NOT EXISTS authorization_email text,
  ADD COLUMN IF NOT EXISTS first_transaction_reference text,
  ADD COLUMN IF NOT EXISTS paystack_payment_status text,
  ADD COLUMN IF NOT EXISTS scheduled_charge_reference text,
  ADD COLUMN IF NOT EXISTS last_charge_error text,
  ADD COLUMN IF NOT EXISTS charge_attempted_at timestamptz;

COMMENT ON COLUMN public.pledges.paystack_authorization_code IS 'Paystack authorization_code — server-only, do not expose to client';
COMMENT ON COLUMN public.pledges.paystack_payment_status IS 'awaiting_authorization | authorized | charged | charge_failed | reminder_only (legacy email-only)';

-- Existing rows: treat as legacy reminder-only pledges
UPDATE public.pledges
SET paystack_payment_status = 'reminder_only'
WHERE paystack_payment_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_pledges_reminder_paystack
  ON public.pledges (reminder_date, paystack_payment_status)
  WHERE status = 'pending';
