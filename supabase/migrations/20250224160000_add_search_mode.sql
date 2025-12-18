-- Add search_mode column to profiles to store user preference (Local vs Global search)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS search_mode text CHECK (search_mode IN ('local', 'global'));

-- Ensure RLS allows updating this column
-- (Existing policies should cover it, but good to be safe)
