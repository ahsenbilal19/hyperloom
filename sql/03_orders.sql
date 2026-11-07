-- Hyperloom Phase 3: orders (run in the Supabase SQL Editor)
create table orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  email text,
  total_cents int not null,
  status text default 'paid',
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  name text not null,
  qty int not null check (qty > 0),
  unit_price_cents int not null
);

alter table orders enable row level security;
alter table order_items enable row level security;

-- atomic + idempotent: creates the order, its items and decrements stock in one transaction
create or replace function place_order(p_session text, p_email text, p_total int, p_items jsonb)
returns uuid language plpgsql security definer as $$
declare v_id uuid; it jsonb;
begin
  insert into orders (stripe_session_id, email, total_cents)
  values (p_session, p_email, p_total)
  on conflict (stripe_session_id) do nothing
  returning id into v_id;

  if v_id is null then  -- already processed
    select id into v_id from orders where stripe_session_id = p_session;
    return v_id;
  end if;

  for it in select * from jsonb_array_elements(p_items) loop
    insert into order_items (order_id, product_id, name, qty, unit_price_cents)
    values (v_id, (it->>'product_id')::uuid, it->>'name', (it->>'qty')::int, (it->>'unit_price_cents')::int);
    update products set stock = greatest(stock - (it->>'qty')::int, 0) where id = (it->>'product_id')::uuid;
  end loop;
  return v_id;
end $$;

revoke all on function place_order(text, text, int, jsonb) from public, anon, authenticated;
