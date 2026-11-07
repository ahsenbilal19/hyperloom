-- Hyperloom schema, Phase 1 (run in the Supabase SQL Editor)
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  category text not null,
  price_cents int not null check (price_cents > 0),
  compare_at_cents int,
  stock int not null default 0 check (stock >= 0),
  rating numeric(2,1) default 4.5,
  review_count int default 0,
  tags text[] default '{}',
  accent text default '#22d3ee',   -- used to colour the product visuals
  accent2 text default '#a78bfa',
  featured boolean default false,
  created_at timestamptz default now()
);

create index idx_products_category on products(category);

-- storefront data is public to read; writes only via the server/admin later
alter table products enable row level security;
create policy "products are public" on products for select using (true);
