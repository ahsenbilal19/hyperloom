-- Hyperloom Phase 4: profiles, roles, order ownership (run in the Supabase SQL Editor)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "read own profile" on profiles for select using (auth.uid() = id);
-- no insert/update policy: users can never change their own role

create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email) values (new.id, new.email) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
insert into profiles (id, email) select id, email from auth.users on conflict do nothing;

-- orders belong to users; customers can read only their own
alter table orders add column user_id uuid references auth.users(id);
create policy "read own orders" on orders for select using (auth.uid() = user_id);
create policy "read own order items" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));

drop function if exists place_order(text, text, int, jsonb);
create function place_order(p_session text, p_email text, p_total int, p_items jsonb, p_user uuid default null)
returns uuid language plpgsql security definer as $$
declare v_id uuid; it jsonb;
begin
  insert into orders (stripe_session_id, email, total_cents, user_id)
  values (p_session, p_email, p_total, p_user)
  on conflict (stripe_session_id) do nothing returning id into v_id;
  if v_id is null then
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
revoke all on function place_order(text, text, int, jsonb, uuid) from public, anon, authenticated;
