-- ========================================================================================
-- SUPABASE POSTGRES SCHEMA FOR COORDCAMP
-- ========================================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  student_id text,
  role text check (role in ('student', 'clubLeader', 'leader', 'admin')) default 'student',
  credits int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;

-- 2. EVENTS TABLE
create table if not exists public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  date timestamp with time zone not null,
  location text,
  latitude double precision,
  longitude double precision,
  radius_meters int default 100,
  category text default 'General',
  capacity int default 100,
  credits int default 10,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.events enable row level security;

-- 3. ATTENDANCE TABLE
create table if not exists public.attendance (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  method text check (method in ('qr', 'geofence', 'manual')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, student_id)
);
alter table public.attendance enable row level security;

-- 4. CLUBS TABLE
create table if not exists public.clubs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text,
  leader_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.clubs enable row level security;

-- 5. CLUB MEMBERS TABLE
create table if not exists public.club_members (
  id uuid default uuid_generate_v4() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(club_id, student_id)
);
alter table public.club_members enable row level security;

-- 6. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.notifications enable row level security;

-- 7. MESSAGES TABLE (Realtime Chat)
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.messages enable row level security;

-- ========================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================================

-- Profiles RLS
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Events RLS
create policy "Events are viewable by everyone." on events for select using (true);
create policy "Leaders and Admins can create events." on events for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('clubLeader', 'leader', 'admin'))
);
create policy "Leaders and Admins can update events." on events for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('clubLeader', 'leader', 'admin'))
);
create policy "Leaders and Admins can delete events." on events for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('clubLeader', 'leader', 'admin'))
);

-- Attendance RLS
create policy "Users can view their own attendance." on attendance for select using (auth.uid() = student_id);
create policy "Leaders can view all attendance." on attendance for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('clubLeader', 'leader', 'admin'))
);
create policy "Users can insert their own attendance." on attendance for insert with check (auth.uid() = student_id);

-- Clubs RLS
create policy "Clubs are viewable by everyone." on clubs for select using (true);
create policy "Leaders can create clubs." on clubs for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('clubLeader', 'leader', 'admin'))
);

-- Club Members RLS
create policy "Club memberships are viewable by everyone." on club_members for select using (true);
create policy "Users can join clubs." on club_members for insert with check (auth.uid() = student_id);

-- Notifications RLS
create policy "Users can view their own notifications." on notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications." on notifications for insert with check (true);

-- Messages RLS
create policy "Club members can view messages." on messages for select using (
  exists (select 1 from club_members where club_id = messages.club_id and student_id = auth.uid())
);
create policy "Club members can insert messages." on messages for insert with check (
  exists (select 1 from club_members where club_id = messages.club_id and student_id = auth.uid())
);

-- 8. CREDITS TABLE
create table if not exists public.credits (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  amount int not null,
  reason text not null,
  awarded_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.credits enable row level security;
create policy "Users can view their own credits." on credits for select using (auth.uid() = student_id);
create policy "Leaders and Admins can view all credits." on credits for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('clubLeader', 'leader', 'admin'))
);
create policy "Leaders and Admins can insert credits." on credits for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('clubLeader', 'leader', 'admin'))
);

-- 9. LEADERBOARD TABLE (materialized view or table to track rankings)
create table if not exists public.leaderboard (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  total_credits int default 0,
  rank int,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id)
);
alter table public.leaderboard enable row level security;
create policy "Leaderboard is viewable by everyone." on leaderboard for select using (true);
create policy "System can manage leaderboard." on leaderboard for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ========================================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ========================================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, student_id, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'student_id',
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
