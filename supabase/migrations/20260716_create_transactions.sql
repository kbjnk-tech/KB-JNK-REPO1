-- Supabase SQL Editor에서 실행하세요.
-- 외환 도우미 거래 기록 테이블

create table if not exists public.transactions (
  id uuid primary key,
  customer_name text not null,
  type text not null,
  currency text not null,
  base_rate numeric not null,
  spread_rate numeric not null,
  preferential_rate numeric not null,
  applied_rate numeric not null,
  foreign_amount numeric not null,
  krw_amount numeric not null,
  fee_total numeric,
  memo text,
  created_at timestamptz not null
);

-- 브라우저(anon key)에서 읽고/쓰려면 RLS 정책 필요
alter table public.transactions enable row level security;

create policy "Allow anon read transactions"
  on public.transactions for select
  to anon
  using (true);

create policy "Allow anon insert transactions"
  on public.transactions for insert
  to anon
  with check (true);

create policy "Allow anon update transactions"
  on public.transactions for update
  to anon
  using (true)
  with check (true);

create policy "Allow anon delete transactions"
  on public.transactions for delete
  to anon
  using (true);
