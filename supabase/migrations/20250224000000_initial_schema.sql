/*
  # Initial Schema for Job Assistant

  ## Query Description:
  Creates the necessary tables for the Job Assistant:
  1. profiles (Seekers) - Stores user info (phone, name, skills, etc.)
  2. jobs - Stores job listings
  3. messages - Stores chat history for the simulator

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - public.profiles: id, phone, name, city, skills, expected_salary, preferred_job_type
  - public.jobs: id, title, company, city, salary, type, description, embedding
  - public.messages: id, profile_id, sender, type, content, job_data
*/

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Profiles Table
create table if not exists public.profiles (
  id uuid default uuid_generate_v4() primary key,
  phone text unique not null,
  name text,
  city text,
  skills text[], -- Array of strings
  expected_salary text,
  preferred_job_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Jobs Table
create table if not exists public.jobs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  company text not null,
  city text not null,
  salary text not null,
  type text not null, -- 'Full-time', 'Part-time', etc.
  description text not null,
  -- We will use simple text search for MVP instead of vector embeddings to avoid complex setup
  -- embedding vector(384), 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Messages Table
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  sender text not null check (sender in ('user', 'bot')),
  type text not null check (type in ('text', 'audio', 'job-card')),
  content text,
  job_data jsonb, -- Stores the job details if type is job-card
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.messages enable row level security;

-- 5. Create Policies (Open for Demo/MVP purposes)
-- In production, these should be restricted based on auth.uid()
create policy "Enable read access for all users" on public.profiles for select using (true);
create policy "Enable insert access for all users" on public.profiles for insert with check (true);
create policy "Enable update access for all users" on public.profiles for update using (true);

create policy "Enable read access for all users" on public.jobs for select using (true);
create policy "Enable insert access for all users" on public.jobs for insert with check (true);
create policy "Enable update access for all users" on public.jobs for update using (true);

create policy "Enable read access for all users" on public.messages for select using (true);
create policy "Enable insert access for all users" on public.messages for insert with check (true);
