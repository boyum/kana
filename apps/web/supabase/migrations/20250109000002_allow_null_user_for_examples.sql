-- Allow NULL user_id for example and test lists
-- This enables us to create system-wide example lists that aren't tied to any user

alter table public.lists
  alter column user_id drop not null;

-- Update the RLS policies to allow access to lists with NULL user_id if they are public or examples
drop policy if exists "Users can view their own lists" on public.lists;
drop policy if exists "Users can view public lists" on public.lists;

create policy "Users can view their own lists"
  on public.lists for select
  using (auth.uid() = user_id);

create policy "Users can view public lists"
  on public.lists for select
  using (is_public = true or is_example = true);

-- Allow anyone to view cards from example lists
drop policy if exists "Users can view cards from public lists" on public.cards;

create policy "Users can view cards from public lists"
  on public.cards for select
  using (
    exists (
      select 1 from public.lists
      where lists.id = cards.list_id
      and (lists.is_public = true or lists.is_example = true)
    )
  );
