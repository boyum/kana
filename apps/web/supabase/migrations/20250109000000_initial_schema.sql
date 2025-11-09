-- Initial schema migration
-- This is an example migration file. Modify as needed for your project.

-- Create a sample table for user profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies for profiles table
-- Users can view all profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Users can insert their own profile
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create a function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Example: Create a sample collection/list table
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.lists enable row level security;

-- Policies for lists
create policy "Users can view their own lists"
  on public.lists for select
  using (auth.uid() = user_id);

create policy "Users can view public lists"
  on public.lists for select
  using (is_public = true);

create policy "Users can create their own lists"
  on public.lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own lists"
  on public.lists for update
  using (auth.uid() = user_id);

create policy "Users can delete their own lists"
  on public.lists for delete
  using (auth.uid() = user_id);

-- Trigger for lists updated_at
create trigger on_lists_updated
  before update on public.lists
  for each row
  execute function public.handle_updated_at();

-- Create indexes for better performance
create index lists_user_id_idx on public.lists (user_id);
create index lists_is_public_idx on public.lists (is_public);
