-- ============================================
-- StudentBoard - Database Schema
-- Sri Lanka O/L Focus (Grades 10-11)
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
create type card_status as enum ('not_started', 'in_progress', 'done');
create type plan_flag as enum ('none', 'this_week', 'this_month');

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- SUBJECTS
-- ============================================
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  grade int not null check (grade between 9 and 13),
  country text not null default 'LK',
  exam text not null default 'OL',
  display_order int default 0,
  created_at timestamptz default now()
);

create index idx_subjects_grade_country on public.subjects(grade, country);

-- ============================================
-- TEMPLATES
-- ============================================
create table public.templates (
  id uuid default uuid_generate_v4() primary key,
  subject_id uuid references public.subjects(id) on delete cascade,
  grade int not null,
  country text not null default 'LK',
  checklist_enabled boolean default true,
  created_at timestamptz default now(),
  unique(subject_id, grade, country)
);

-- ============================================
-- TEMPLATE CARDS
-- ============================================
create table public.template_cards (
  id uuid default uuid_generate_v4() primary key,
  template_id uuid references public.templates(id) on delete cascade,
  title text not null,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- ============================================
-- TEMPLATE CHECKLIST ITEMS
-- ============================================
create table public.template_checklist_items (
  id uuid default uuid_generate_v4() primary key,
  template_card_id uuid references public.template_cards(id) on delete cascade,
  text text not null,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- ============================================
-- BOARDS (user's study boards)
-- ============================================
create table public.boards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) not null,
  grade int not null,
  name text not null,
  show_weekly boolean default false,
  show_monthly boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_boards_user_id on public.boards(user_id);

-- ============================================
-- CARDS (items on a board)
-- ============================================
create table public.cards (
  id uuid default uuid_generate_v4() primary key,
  board_id uuid references public.boards(id) on delete cascade not null,
  title text not null,
  notes text,
  status card_status default 'not_started',
  plan plan_flag default 'none',
  display_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_cards_board_id on public.cards(board_id);
create index idx_cards_status on public.cards(status);

-- ============================================
-- CHECKLIST ITEMS (subtasks on a card)
-- ============================================
create table public.checklist_items (
  id uuid default uuid_generate_v4() primary key,
  card_id uuid references public.cards(id) on delete cascade not null,
  text text not null,
  is_done boolean default false,
  display_order int not null default 0,
  created_at timestamptz default now()
);

create index idx_checklist_items_card_id on public.checklist_items(card_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.templates enable row level security;
alter table public.template_cards enable row level security;
alter table public.template_checklist_items enable row level security;
alter table public.boards enable row level security;
alter table public.cards enable row level security;
alter table public.checklist_items enable row level security;

-- Profiles: users can read/update their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Subjects: everyone can read (public reference data)
create policy "Anyone can view subjects"
  on public.subjects for select using (true);

-- Templates: everyone can read (public reference data)
create policy "Anyone can view templates"
  on public.templates for select using (true);
create policy "Anyone can view template cards"
  on public.template_cards for select using (true);
create policy "Anyone can view template checklist items"
  on public.template_checklist_items for select using (true);

-- Boards: users can CRUD their own
create policy "Users can view own boards"
  on public.boards for select using (auth.uid() = user_id);
create policy "Users can create own boards"
  on public.boards for insert with check (auth.uid() = user_id);
create policy "Users can update own boards"
  on public.boards for update using (auth.uid() = user_id);
create policy "Users can delete own boards"
  on public.boards for delete using (auth.uid() = user_id);

-- Cards: users can CRUD cards on their boards
create policy "Users can view own cards"
  on public.cards for select using (
    board_id in (select id from public.boards where user_id = auth.uid())
  );
create policy "Users can create cards on own boards"
  on public.cards for insert with check (
    board_id in (select id from public.boards where user_id = auth.uid())
  );
create policy "Users can update own cards"
  on public.cards for update using (
    board_id in (select id from public.boards where user_id = auth.uid())
  );
create policy "Users can delete own cards"
  on public.cards for delete using (
    board_id in (select id from public.boards where user_id = auth.uid())
  );

-- Checklist items: users can CRUD items on their cards
create policy "Users can view own checklist items"
  on public.checklist_items for select using (
    card_id in (
      select c.id from public.cards c
      join public.boards b on c.board_id = b.id
      where b.user_id = auth.uid()
    )
  );
create policy "Users can create checklist items"
  on public.checklist_items for insert with check (
    card_id in (
      select c.id from public.cards c
      join public.boards b on c.board_id = b.id
      where b.user_id = auth.uid()
    )
  );
create policy "Users can update own checklist items"
  on public.checklist_items for update using (
    card_id in (
      select c.id from public.cards c
      join public.boards b on c.board_id = b.id
      where b.user_id = auth.uid()
    )
  );
create policy "Users can delete own checklist items"
  on public.checklist_items for delete using (
    card_id in (
      select c.id from public.cards c
      join public.boards b on c.board_id = b.id
      where b.user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_boards_updated_at
  before update on public.boards
  for each row execute function public.update_updated_at();

create trigger update_cards_updated_at
  before update on public.cards
  for each row execute function public.update_updated_at();

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();
