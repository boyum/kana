-- Change ID columns from UUID to TEXT to support custom ID format
-- This allows us to use timestamp-based IDs like "1762718721853-dx7jgikow"

-- First, drop all policies that depend on these columns
drop policy if exists "Users can view their own lists" on public.lists;
drop policy if exists "Users can view public lists" on public.lists;
drop policy if exists "Users can create their own lists" on public.lists;
drop policy if exists "Users can update their own lists" on public.lists;
drop policy if exists "Users can delete their own lists" on public.lists;
drop policy if exists "Users can view cards from their own lists" on public.cards;
drop policy if exists "Users can view cards from public lists" on public.cards;
drop policy if exists "Users can insert cards to their own lists" on public.cards;
drop policy if exists "Users can update cards in their own lists" on public.cards;
drop policy if exists "Users can delete cards from their own lists" on public.cards;

-- Drop foreign key constraints
alter table public.cards drop constraint if exists cards_list_id_fkey;
alter table public.lists drop constraint if exists lists_user_id_fkey;

-- Change column types
alter table public.lists alter column id type text using id::text;
alter table public.lists alter column user_id type text using user_id::text;
alter table public.cards alter column id type text using id::text;
alter table public.cards alter column list_id type text using list_id::text;

-- Add back foreign key constraints
alter table public.cards add constraint cards_list_id_fkey
  foreign key (list_id) references public.lists(id) on delete cascade;

-- Recreate policies for lists
create policy "Users can view their own lists"
  on public.lists for select
  using (auth.uid()::text = user_id);

create policy "Users can view public lists"
  on public.lists for select
  using (is_public = true or is_example = true);

create policy "Users can create their own lists"
  on public.lists for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update their own lists"
  on public.lists for update
  using (auth.uid()::text = user_id);

create policy "Users can delete their own lists"
  on public.lists for delete
  using (auth.uid()::text = user_id);

-- Recreate policies for cards
create policy "Users can view cards from their own lists"
  on public.cards for select
  using (
    exists (
      select 1 from public.lists
      where lists.id = cards.list_id
      and lists.user_id = auth.uid()::text
    )
  );

create policy "Users can view cards from public lists"
  on public.cards for select
  using (
    exists (
      select 1 from public.lists
      where lists.id = cards.list_id
      and (lists.is_public = true or lists.is_example = true)
    )
  );

create policy "Users can insert cards to their own lists"
  on public.cards for insert
  with check (
    exists (
      select 1 from public.lists
      where lists.id = cards.list_id
      and lists.user_id = auth.uid()::text
    )
  );

create policy "Users can update cards in their own lists"
  on public.cards for update
  using (
    exists (
      select 1 from public.lists
      where lists.id = cards.list_id
      and lists.user_id = auth.uid()::text
    )
  );

create policy "Users can delete cards from their own lists"
  on public.cards for delete
  using (
    exists (
      select 1 from public.lists
      where lists.id = cards.list_id
      and lists.user_id = auth.uid()::text
    )
  );
