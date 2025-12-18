/*
  # Add Applications Table
  
  1. New Tables
     - `applications`
       - `id` (uuid, primary key)
       - `job_id` (uuid, references jobs)
       - `seeker_id` (uuid, references profiles)
       - `created_at` (timestamp)
  
  2. Constraints
     - Unique constraint on (job_id, seeker_id) to prevent duplicate applications
  
  3. Security
     - Enable RLS
     - Add policies for reading and inserting
*/

create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade not null,
  seeker_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(job_id, seeker_id)
);

-- Enable RLS
alter table applications enable row level security;

-- Policies (Open for demo purposes to avoid auth friction)
create policy "Enable read access for all users"
on applications for select
using (true);

create policy "Enable insert access for all users"
on applications for insert
with check (true);
