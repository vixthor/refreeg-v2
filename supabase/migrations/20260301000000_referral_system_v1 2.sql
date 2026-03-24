-- Referral System V1 Migration (Refined)

-- Create referrals_v1 table with tracking fields
CREATE TABLE IF NOT EXISTS referrals_v1 (
    id_v1 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id_v1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referee_id_v1 UUID REFERENCES profiles(id) ON DELETE SET NULL,
    referee_email_v1 TEXT NOT NULL,
    registered_v1 BOOLEAN DEFAULT FALSE,
    reward_v1 TEXT,
    
    -- Tracking fields
    utm_source_v1 TEXT,
    utm_medium_v1 TEXT,
    utm_campaign_v1 TEXT,
    ip_address_v1 TEXT,
    user_agent_v1 TEXT,
    
    created_at_v1 TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_v1_referrer ON referrals_v1(referrer_id_v1);
CREATE INDEX IF NOT EXISTS idx_referrals_v1_referee_email ON referrals_v1(referee_email_v1);
CREATE INDEX IF NOT EXISTS idx_referrals_v1_utm_source ON referrals_v1(utm_source_v1);

-- We are using the EXISTING referral_code column in profiles, so no ALTER TABLE profiles needed.
