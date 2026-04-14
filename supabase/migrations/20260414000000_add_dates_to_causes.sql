
-- Add start_date and end_date columns to causes table
ALTER TABLE causes ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE causes ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Add start_date and end_date columns to cause_edits table
ALTER TABLE cause_edits ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE cause_edits ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Index for expiration queries
CREATE INDEX IF NOT EXISTS idx_causes_end_date ON causes(end_date) WHERE status = 'approved';

-- Populate existing causes
UPDATE causes 
SET 
  start_date = created_at,
  end_date = created_at + (COALESCE(days_active, 30) || ' days')::interval
WHERE start_date IS NULL;

-- Populate existing cause_edits
UPDATE cause_edits
SET 
  start_date = created_at,
  end_date = created_at + (COALESCE(days_active, 30) || ' days')::interval
WHERE start_date IS NULL;
