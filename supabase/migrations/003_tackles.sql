-- ================================================================
-- 003_tackles.sql — タックル管理テーブル
--
-- 実行方法:
--   Supabase ダッシュボード → SQL Editor → このファイルの内容を貼り付けて実行
-- ================================================================

create table if not exists tackles (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  rod         text,
  reel        text,
  line        text,
  leader      text,
  lure        text,
  purpose     text,
  memo        text,
  created_at  timestamptz not null default now()
);

-- ── RLS ─────────────────────────────────────────────────────────
alter table tackles enable row level security;

create policy "tackles: 自分のレコードのみ読取"
  on tackles for select
  using (auth.uid() = user_id);

create policy "tackles: 自分のレコードのみ追加"
  on tackles for insert
  with check (auth.uid() = user_id);

create policy "tackles: 自分のレコードのみ削除"
  on tackles for delete
  using (auth.uid() = user_id);
