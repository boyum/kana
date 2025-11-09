-- Migration for custom lists and cards tables
-- This migration extends the lists table and adds cards table for flashcard functionality

-- Add additional columns to lists table for custom list functionality
alter table public.lists
  add column if not exists default_direction text check (default_direction in ('front-to-back', 'back-to-front')) default 'front-to-back',
  add column if not exists is_example boolean default false,
  add column if not exists is_test_data boolean default false;

-- Create cards table for flashcard content
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.lists(id) on delete cascade not null,
  front text not null,
  back text not null,
  meaning text,
  notes text,
  tags jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_reviewed_at timestamptz,

  -- Performance metrics
  view_count integer default 0,
  flip_count integer default 0,
  correct_count integer default 0,
  incorrect_count integer default 0,
  total_response_time_ms bigint default 0,
  fastest_response_ms integer,
  slowest_response_ms integer,
  mastery_level integer default 0 check (mastery_level >= 0 and mastery_level <= 100)
);

-- Enable Row Level Security for cards
alter table public.cards enable row level security;

-- Policies for cards table
-- Users can view cards from their own lists
create policy "Users can view cards from their own lists"
  on public.cards for select
  using (
    exists (
      select 1 from public.lists
      where lists.id = cards.list_id
      and lists.user_id = auth.uid()
    )
  );

-- Users can view cards from public lists
create policy "Users can view cards from public lists"
  on public.cards for select
  using (
    exists (
      select 1 from public.lists
      where lists.id = cards.list_id
      and lists.is_public = true
    )
  );

-- Users can insert cards to their own lists
create policy "Users can insert cards to their own lists"
  on public.cards for insert
  with check (
    exists (
      select 1 from public.lists
      where lists.id = cards.list_id
      and lists.user_id = auth.uid()
    )
  );

-- Users can update cards in their own lists
create policy "Users can update cards in their own lists"
  on public.cards for update
  using (
    exists (
      select 1 from public.lists
      where lists.id = cards.list_id
      and lists.user_id = auth.uid()
    )
  );

-- Users can delete cards from their own lists
create policy "Users can delete cards from their own lists"
  on public.cards for delete
  using (
    exists (
      select 1 from public.lists
      where lists.id = cards.list_id
      and lists.user_id = auth.uid()
    )
  );

-- Trigger for cards updated_at
create trigger on_cards_updated
  before update on public.cards
  for each row
  execute function public.handle_updated_at();

-- Create indexes for better performance
create index cards_list_id_idx on public.cards (list_id);
create index cards_tags_idx on public.cards using gin (tags);
create index lists_is_example_idx on public.lists (is_example);
create index lists_is_test_data_idx on public.lists (is_test_data);

-- Add comment to clarify the purpose of is_example and is_test_data
comment on column public.lists.is_example is 'Flag to mark example lists created by the system';
comment on column public.lists.is_test_data is 'Flag to mark test data for development/testing purposes';
