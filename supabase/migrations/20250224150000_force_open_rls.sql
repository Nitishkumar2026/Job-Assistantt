/*
  # Force Open RLS Policies for Demo
  
  ## Query Description: 
  This migration relaxes the Row Level Security (RLS) policies for 'applications' and 'profiles' tables.
  Since this is a demo application using phone-number based identity (without full Supabase Auth),
  we need to allow public access to these tables to ensure the "Apply" feature works reliably.
  
  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Drops existing restrictive policies on 'applications' and 'profiles'
  - Creates new permissive policies allowing ALL operations (SELECT, INSERT, UPDATE, DELETE)
  
  ## Security Implications:
  - RLS Status: Enabled but Permissive
  - Policy Changes: Yes (Opening access)
  - Auth Requirements: None (Public access for demo)
*/

-- 1. APPLICATIONS TABLE
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop potential existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public access to applications" ON applications;
DROP POLICY IF EXISTS "Enable read access for all users" ON applications;
DROP POLICY IF EXISTS "Enable insert for all users" ON applications;
DROP POLICY IF EXISTS "Give anon access to applications" ON applications;

-- Create a single, simple permissive policy
CREATE POLICY "Allow public access to applications"
ON applications
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. PROFILES TABLE
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON profiles;

CREATE POLICY "Allow public access to profiles"
ON profiles
FOR ALL
USING (true)
WITH CHECK (true);

-- 3. JOBS TABLE (Ensure it's readable)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to jobs" ON jobs;

CREATE POLICY "Allow public read access to jobs"
ON jobs
FOR SELECT
USING (true);
