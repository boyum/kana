-- Migration for progress tracking and statistics
-- This migration adds tables to track practice sessions and performance over time

-- Create practice_sessions table to track individual study sessions
create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  list_id uuid references public.lists(id) on delete cascade not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_ms bigint,

  -- Session statistics
  total_cards integer default 0,
  cards_reviewed integer default 0,
  correct_answers integer default 0,
  incorrect_answers integer default 0,
  skipped_cards integer default 0,
  average_response_time_ms integer,

  -- Session metadata
  session_type text check (session_type in ('practice', 'test', 'review')) default 'practice',
  direction text check (direction in ('front-to-back', 'back-to-front')) default 'front-to-back',
  completed boolean default false,

  created_at timestamptz default now()
);

-- Create session_card_attempts table to track individual card interactions within sessions
create table if not exists public.session_card_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.practice_sessions(id) on delete cascade not null,
  card_id uuid references public.cards(id) on delete cascade not null,

  -- Attempt details
  attempted_at timestamptz not null default now(),
  response_time_ms integer,
  was_correct boolean,
  was_skipped boolean default false,

  -- Additional context
  difficulty_rating integer check (difficulty_rating >= 1 and difficulty_rating <= 5),
  notes text,

  created_at timestamptz default now()
);

-- Create daily_stats table for aggregated daily statistics (materialized for performance)
create table if not exists public.daily_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  list_id uuid references public.lists(id) on delete cascade,
  date date not null,

  -- Daily aggregates
  sessions_count integer default 0,
  total_duration_ms bigint default 0,
  cards_reviewed integer default 0,
  correct_answers integer default 0,
  incorrect_answers integer default 0,
  accuracy_percentage numeric(5,2),
  average_response_time_ms integer,

  -- Mastery progress
  average_mastery_level numeric(5,2),
  cards_mastered integer default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Ensure one record per user/list/date combination
  unique(user_id, list_id, date)
);

-- Enable Row Level Security
alter table public.practice_sessions enable row level security;
alter table public.session_card_attempts enable row level security;
alter table public.daily_stats enable row level security;

-- Policies for practice_sessions
create policy "Users can view their own practice sessions"
  on public.practice_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own practice sessions"
  on public.practice_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own practice sessions"
  on public.practice_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own practice sessions"
  on public.practice_sessions for delete
  using (auth.uid() = user_id);

-- Policies for session_card_attempts
create policy "Users can view their own session card attempts"
  on public.session_card_attempts for select
  using (
    exists (
      select 1 from public.practice_sessions
      where practice_sessions.id = session_card_attempts.session_id
      and practice_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert their own session card attempts"
  on public.session_card_attempts for insert
  with check (
    exists (
      select 1 from public.practice_sessions
      where practice_sessions.id = session_card_attempts.session_id
      and practice_sessions.user_id = auth.uid()
    )
  );

create policy "Users can update their own session card attempts"
  on public.session_card_attempts for update
  using (
    exists (
      select 1 from public.practice_sessions
      where practice_sessions.id = session_card_attempts.session_id
      and practice_sessions.user_id = auth.uid()
    )
  );

create policy "Users can delete their own session card attempts"
  on public.session_card_attempts for delete
  using (
    exists (
      select 1 from public.practice_sessions
      where practice_sessions.id = session_card_attempts.session_id
      and practice_sessions.user_id = auth.uid()
    )
  );

-- Policies for daily_stats
create policy "Users can view their own daily stats"
  on public.daily_stats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own daily stats"
  on public.daily_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own daily stats"
  on public.daily_stats for update
  using (auth.uid() = user_id);

create policy "Users can delete their own daily stats"
  on public.daily_stats for delete
  using (auth.uid() = user_id);

-- Create indexes for performance
create index practice_sessions_user_id_idx on public.practice_sessions (user_id);
create index practice_sessions_list_id_idx on public.practice_sessions (list_id);
create index practice_sessions_started_at_idx on public.practice_sessions (started_at desc);
create index practice_sessions_user_started_idx on public.practice_sessions (user_id, started_at desc);

create index session_card_attempts_session_id_idx on public.session_card_attempts (session_id);
create index session_card_attempts_card_id_idx on public.session_card_attempts (card_id);
create index session_card_attempts_attempted_at_idx on public.session_card_attempts (attempted_at desc);

create index daily_stats_user_id_idx on public.daily_stats (user_id);
create index daily_stats_list_id_idx on public.daily_stats (list_id);
create index daily_stats_date_idx on public.daily_stats (date desc);
create index daily_stats_user_date_idx on public.daily_stats (user_id, date desc);

-- Trigger for daily_stats updated_at
create trigger on_daily_stats_updated
  before update on public.daily_stats
  for each row
  execute function public.handle_updated_at();

-- Function to update daily stats when a session is completed
create or replace function public.update_daily_stats_on_session_complete()
returns trigger
language plpgsql
security definer
as $$
declare
  v_date date;
  v_accuracy numeric;
begin
  -- Only proceed if session is marked as completed
  if new.completed = true and (old.completed is null or old.completed = false) then
    v_date := date(new.started_at);

    -- Calculate accuracy
    if new.cards_reviewed > 0 then
      v_accuracy := (new.correct_answers::numeric / new.cards_reviewed::numeric) * 100;
    else
      v_accuracy := 0;
    end if;

    -- Insert or update daily stats
    insert into public.daily_stats (
      user_id,
      list_id,
      date,
      sessions_count,
      total_duration_ms,
      cards_reviewed,
      correct_answers,
      incorrect_answers,
      accuracy_percentage,
      average_response_time_ms
    ) values (
      new.user_id,
      new.list_id,
      v_date,
      1,
      coalesce(new.duration_ms, 0),
      new.cards_reviewed,
      new.correct_answers,
      new.incorrect_answers,
      v_accuracy,
      new.average_response_time_ms
    )
    on conflict (user_id, list_id, date)
    do update set
      sessions_count = daily_stats.sessions_count + 1,
      total_duration_ms = daily_stats.total_duration_ms + coalesce(new.duration_ms, 0),
      cards_reviewed = daily_stats.cards_reviewed + new.cards_reviewed,
      correct_answers = daily_stats.correct_answers + new.correct_answers,
      incorrect_answers = daily_stats.incorrect_answers + new.incorrect_answers,
      accuracy_percentage = case
        when (daily_stats.cards_reviewed + new.cards_reviewed) > 0
        then ((daily_stats.correct_answers + new.correct_answers)::numeric /
              (daily_stats.cards_reviewed + new.cards_reviewed)::numeric) * 100
        else 0
      end,
      average_response_time_ms = case
        when (daily_stats.sessions_count + 1) > 0
        then ((daily_stats.average_response_time_ms * daily_stats.sessions_count +
              coalesce(new.average_response_time_ms, 0)) /
              (daily_stats.sessions_count + 1))::integer
        else coalesce(new.average_response_time_ms, 0)
      end,
      updated_at = now();
  end if;

  return new;
end;
$$;

-- Create trigger for updating daily stats
create trigger on_session_completed
  after update on public.practice_sessions
  for each row
  execute function public.update_daily_stats_on_session_complete();

-- Add comments for documentation
comment on table public.practice_sessions is 'Tracks individual practice sessions with aggregate statistics';
comment on table public.session_card_attempts is 'Tracks individual card interactions within practice sessions';
comment on table public.daily_stats is 'Aggregated daily statistics for performance tracking and trends';
comment on column public.practice_sessions.session_type is 'Type of session: practice (normal), test (no hints), or review (focused on weak cards)';
comment on column public.session_card_attempts.difficulty_rating is 'User-provided difficulty rating from 1 (very easy) to 5 (very hard)';
