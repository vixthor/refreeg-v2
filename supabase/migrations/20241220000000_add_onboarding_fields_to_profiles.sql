-- Add onboarding fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_name TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add unique constraint to username
ALTER TABLE profiles
ADD CONSTRAINT unique_username UNIQUE (username);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON profiles(first_name) WHERE first_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON profiles(last_name) WHERE last_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender) WHERE gender IS NOT NULL;
