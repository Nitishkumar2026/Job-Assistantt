/*
  # Fix RLS Policies for Public Access
  
  ## Query Description: 
  This migration enables Row Level Security (RLS) on all tables but adds permissive policies 
  to allow the simulated chat app (running as 'anon') to Read, Insert, and Update data.
  
  ## Metadata:
  - Schema-Category: "Security"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Tables: profiles, jobs, applications, messages
  - Policies: "Enable access for all users" (SELECT, INSERT, UPDATE, DELETE)
*/

-- 1. PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update access for all users" ON profiles;

CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON profiles FOR UPDATE USING (true);

-- 2. JOBS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON jobs;
DROP POLICY IF EXISTS "Enable insert access for all users" ON jobs;
DROP POLICY IF EXISTS "Enable update access for all users" ON jobs;

CREATE POLICY "Enable read access for all users" ON jobs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON jobs FOR UPDATE USING (true);

-- 3. APPLICATIONS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON applications;
DROP POLICY IF EXISTS "Enable insert access for all users" ON applications;
DROP POLICY IF EXISTS "Enable update access for all users" ON applications;

CREATE POLICY "Enable read access for all users" ON applications FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON applications FOR UPDATE USING (true);

-- 4. MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON messages;
DROP POLICY IF EXISTS "Enable insert access for all users" ON messages;

CREATE POLICY "Enable read access for all users" ON messages FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON messages FOR INSERT WITH CHECK (true);
