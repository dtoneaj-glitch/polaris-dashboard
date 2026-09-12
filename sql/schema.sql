-- 北極星 Polaris Dashboard 資料庫schema
-- 執行位置：Supabase Dashboard → SQL Editor

-- 啟用 RLS (Row Level Security)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists projects (
  id text primary key,
  name text not null,
  description text,
  stage text default 'idea',
  color text default '#ff6a4d',
  progress integer default 0,
  next_step text,
  created_at timestamptz default now(),
  last_updated timestamptz default now(),
  owner_email text not null references profiles(email)
);

create table if not exists tasks (
  id text primary key,
  title text not null,
  project_id text references projects(id) on delete cascade,
  due_date text,
  priority text default 'medium',
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  order_index integer default 0,
  owner_email text not null references profiles(email)
);

create table if not exists ideas (
  id text primary key,
  title text not null,
  description text,
  category text default 'other',
  is_active boolean default false,
  created_at timestamptz default now(),
  order_index integer default 0,
  owner_email text not null references profiles(email)
);

create table if not exists notes (
  id text primary key,
  title text not null,
  content text,
  tags text[] default '{}',
  project_id text references projects(id) on delete cascade,
  created_at timestamptz default now(),
  owner_email text not null references profiles(email)
);

create table if not exists timeline_events (
  id text primary key,
  title text not null,
  type text default 'note',
  date text,
  project_id text references projects(id) on delete cascade,
  created_at timestamptz default now(),
  owner_email text not null references profiles(email)
);

create table if not exists goals (
  id text primary key,
  title text not null,
  description text,
  progress integer default 0,
  target_progress integer default 100,
  color text default '#4ecdc4',
  linked_project_id text references projects(id) on delete set null,
  created_at timestamptz default now(),
  owner_email text not null references profiles(email)
);

create table if not exists snapshots (
  id text primary key,
  date text not null unique,
  projects_data jsonb default '{}',
  tasks_done integer default 0,
  tasks_open integer default 0,
  created_at timestamptz default now(),
  owner_email text not null references profiles(email)
);

create table if not exists reviews (
  id text primary key,
  week_key text not null unique,
  title text,
  summary text,
  highlights jsonb default '[]',
  lowlights jsonb default '[]',
  lessons jsonb default '[]',
  next_week_plan text,
  created_at timestamptz default now(),
  owner_email text not null references profiles(email)
);

-- 啟用 Row Level Security
alter table profiles enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table ideas enable row level security;
alter table notes enable row level security;
alter table timeline_events enable row level security;
alter table goals enable row level security;
alter table snapshots enable row level security;
alter table reviews enable row level security;

-- 自訂 policy：每個用戶只能讀寫自己的資料
create policy "用戶可讀取自己的資料"
  on projects for select
  using (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可寫入自己的資料"
  on projects for all
  with check (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可讀取自己的任務"
  on tasks for select
  using (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可寫入自己的任務"
  on tasks for all
  with check (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可讀取自己的靈感"
  on ideas for select
  using (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可寫入自己的靈感"
  on ideas for all
  with check (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可讀取自己的筆記"
  on notes for select
  using (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可寫入自己的筆記"
  on notes for all
  with check (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可讀取自己的時間軸"
  on timeline_events for select
  using (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可寫入自己的時間軸"
  on timeline_events for all
  with check (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可讀取自己的目標"
  on goals for select
  using (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可寫入自己的目標"
  on goals for all
  with check (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可讀取自己的快照"
  on snapshots for select
  using (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可寫入自己的快照"
  on snapshots for all
  with check (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可讀取自己的回顧"
  on reviews for select
  using (auth.jwt() ->> 'email' = owner_email);

create policy "用戶可寫入自己的回顧"
  on reviews for all
  with check (auth.jwt() ->> 'email' = owner_email);

-- 建立函數處理觸發器（更新 last_updated）
create or replace function update_projects_updated_at()
returns trigger as $$
begin
  new.last_updated = now();
  return new;
end;
$$ language plpgsql;

create trigger set_projects_updated_at
  before update on projects
  for each row
  execute function update_projects_updated_at();
