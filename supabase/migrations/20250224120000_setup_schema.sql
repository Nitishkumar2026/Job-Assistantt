/*
  # Setup Job Assistant Schema
  
  ## Query Description:
  This migration sets up the core tables for the Job Assistant application and enables Vector Search.
  It creates tables for User Profiles, Jobs, and Chat Messages, and sets up the matching function.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Tables: profiles, jobs, messages
  - Extensions: vector
  - Functions: match_jobs (for semantic search)
  
  ## Security Implications:
  - RLS Enabled on all tables
  - Public access policies created for demo purposes (allows anon access)
*/

-- 1. Enable Vector Extension for Embeddings
create extension if not exists vector;

-- 2. Create Profiles Table (Stores user info linked by Phone)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text,
  city text,
  skills text[],
  expected_salary text,
  preferred_job_type text,
  created_at timestamptz default now()
);

-- 3. Create Jobs Table (Stores job listings + Vector Embeddings)
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  city text not null,
  salary text,
  type text,
  description text,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  created_at timestamptz default now()
);

-- 4. Create Messages Table (Stores chat history)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  sender text not null check (sender in ('user', 'bot')),
  type text not null,
  content text,
  job_data jsonb,
  created_at timestamptz default now()
);

-- 5. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.messages enable row level security;

-- 6. Create Permissive Policies for Demo (Allow Anon Access)
-- Note: In a production app, you would restrict this to authenticated users.
create policy "Public Access Profiles" on public.profiles for all using (true) with check (true);
create policy "Public Access Jobs" on public.jobs for all using (true) with check (true);
create policy "Public Access Messages" on public.messages for all using (true) with check (true);

-- 7. Create Vector Matching Function
-- This function calculates cosine similarity between the query and job embeddings
create or replace function match_jobs (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns setof jobs
language plpgsql
as $$
begin
  return query
  select *
  from jobs
  where 1 - (jobs.embedding <=> query_embedding) > match_threshold
  order by jobs.embedding <=> query_embedding
  limit match_count;
end;
$$;
