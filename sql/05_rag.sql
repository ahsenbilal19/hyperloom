-- Hyperloom Phase 5: vector search for the AI assistant (run in the Supabase SQL Editor)
create extension if not exists vector;

alter table products add column if not exists embedding vector(768);

create or replace function match_products(query_embedding vector(768), match_count int default 5)
returns table (id uuid, slug text, name text, tagline text, description text, category text,
               price_cents int, stock int, rating numeric, accent text, accent2 text, similarity float)
language sql stable as $$
  select p.id, p.slug, p.name, p.tagline, p.description, p.category, p.price_cents, p.stock, p.rating,
         p.accent, p.accent2, 1 - (p.embedding <=> query_embedding) as similarity
  from products p
  where p.embedding is not null
  order by p.embedding <=> query_embedding
  limit match_count;
$$;

revoke all on function match_products(vector, int) from public, anon, authenticated;
