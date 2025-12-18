-- DISABLE ROW LEVEL SECURITY (RLS) FOR DEMO PURPOSES
-- This ensures that the 'anon' key can Read, Write, Update, and Delete data without restriction.

-- 1. Profiles Table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Jobs Table
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- 3. Messages Table
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 4. Applications Table
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

-- 5. Grant Permissions to Anon Role (Just in case)
GRANT ALL ON profiles TO anon;
GRANT ALL ON jobs TO anon;
GRANT ALL ON messages TO anon;
GRANT ALL ON applications TO anon;

GRANT ALL ON profiles TO service_role;
GRANT ALL ON jobs TO service_role;
GRANT ALL ON messages TO service_role;
GRANT ALL ON applications TO service_role;
