-- Create the instruments table
-- This migration follows the Supabase official quickstart guide
-- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

-- Create the table
create table if not exists instruments (
  id bigint primary key generated always as identity,
  name text not null
);

-- Insert some sample data into the table
insert into instruments (name)
values
  ('violin'),
  ('viola'),
  ('cello')
on conflict do nothing;

-- Enable Row Level Security
alter table instruments enable row level security;

-- Create a policy to make the data publicly readable
-- This allows anonymous users to read the instruments table
create policy "public can read instruments"
on public.instruments
for select
to anon
using (true);

-- Also allow authenticated users to read
create policy "authenticated can read instruments"
on public.instruments
for select
to authenticated
using (true);

