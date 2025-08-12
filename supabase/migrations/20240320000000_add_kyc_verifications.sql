-- Create kyc_verifications table
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    verification_notes TEXT,
    full_name TEXT,
    dob TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal TEXT,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS kyc_verifications_user_id_idx ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS kyc_verifications_status_idx ON kyc_verifications(status);

-- Add RLS policies
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own verifications
CREATE POLICY "Users can view own verifications"
    ON kyc_verifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow admins to view all verifications
CREATE POLICY "Admins can view all verifications"
    ON kyc_verifications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Allow admins to insert verifications
CREATE POLICY "Admins can insert verifications"
    ON kyc_verifications
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Allow admins to update verifications
CREATE POLICY "Admins can update verifications"
    ON kyc_verifications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Allow admins to delete verifications
CREATE POLICY "Admins can delete verifications"
    ON kyc_verifications
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Service role can manage verifications (for server actions)
CREATE POLICY "Service role can manage verifications"
    ON kyc_verifications
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Users can upload their own documents"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'kyc-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own documents"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'kyc-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Only service role can delete documents
CREATE POLICY "Service role can delete documents"
    ON storage.objects
    FOR DELETE
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_kyc_verifications_updated_at
    BEFORE UPDATE ON kyc_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 