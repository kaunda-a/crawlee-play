create table tasks (
  id uuid default uuid_generate_v4() primary key,
  type text not null,
  parameters jsonb not null,
  url text,
  google_search_query text,
  google_search_target text,
  actions jsonb default '[]'::jsonb,
  status text default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table tasks enable row level security;

-- Create policies
create policy "Enable read access for all users" on tasks for select using (true);
create policy "Enable insert for authenticated users only" on tasks for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on tasks for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on tasks for delete using (auth.role() = 'authenticated');
