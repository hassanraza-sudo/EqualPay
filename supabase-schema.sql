-- Supabase schema for EqualPay

-- Roommates table
create table if not exists roommates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now()
);

-- Expenses table
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  amount numeric not null,
  paidby uuid not null references roommates(id) on delete cascade,
  participants uuid[] not null,
  notes text,
  date date not null,
  category text not null,
  created_at timestamp with time zone default now()
);

alter table roommates enable row level security;
create policy if not exists "Allow select" on roommates for select using (true);
create policy if not exists "Allow insert" on roommates for insert with check (true);
create policy if not exists "Allow update" on roommates for update using (true) with check (true);
create policy if not exists "Allow delete" on roommates for delete using (true);

alter table expenses enable row level security;
create policy if not exists "Allow select" on expenses for select using (true);
create policy if not exists "Allow insert" on expenses for insert with check (true);
create policy if not exists "Allow update" on expenses for update using (true) with check (true);
create policy if not exists "Allow delete" on expenses for delete using (true);

-- Enable extensions if needed
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
