create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  retailcrm_id text not null,
  order_number text,
  first_name text,
  last_name text,
  phone text,
  email text,
  status text,
  order_type text,
  order_method text,
  city text,
  address_text text,
  utm_source text,
  items_count integer not null default 0,
  total_amount numeric(12, 2) not null default 0,
  order_created_at timestamptz,
  telegram_alert_sent_at timestamptz,
  raw_payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists orders_retailcrm_id_idx on public.orders (retailcrm_id);
create index if not exists orders_order_created_at_idx on public.orders (order_created_at desc);
create index if not exists orders_total_amount_idx on public.orders (total_amount desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();
