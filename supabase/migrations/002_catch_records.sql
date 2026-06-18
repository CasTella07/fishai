-- ================================================================
-- 002_catch_records.sql — 釣果記録テーブル + Storage 設定
--
-- 実行方法:
--   Supabase ダッシュボード → SQL Editor → このファイルの内容を貼り付けて実行
--
-- Storage バケット "catch-photos" は SQL で作成後、
-- ダッシュボードの Storage → catch-photos → Settings で
-- Public bucket: ON にしてください。
-- ================================================================

-- ── 釣果記録テーブル ─────────────────────────────────────────────
create table if not exists catch_records (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  fish_name     text        not null,
  date          date        not null,
  location      text,
  length_cm     numeric(5,1),
  count         integer     not null default 1,
  time_slot     text,
  method        text,
  bait          text,
  note          text,
  photo_url     text,
  ai_confidence text,        -- "高" / "中" / "低"
  ai_size_note  text,
  created_at    timestamptz not null default now()
);

-- ── RLS ─────────────────────────────────────────────────────────
alter table catch_records enable row level security;

create policy "catch_records: 自分のレコードのみ読取"
  on catch_records for select
  using (auth.uid() = user_id);

create policy "catch_records: 自分のレコードのみ追加"
  on catch_records for insert
  with check (auth.uid() = user_id);

create policy "catch_records: 自分のレコードのみ削除"
  on catch_records for delete
  using (auth.uid() = user_id);

-- ── Storage バケット ─────────────────────────────────────────────
-- Supabase Storage API を通じてバケットを作成。
-- 同じ ID が存在する場合は何もしない（on conflict で無視）。
insert into storage.buckets (id, name, public)
values ('catch-photos', 'catch-photos', true)
on conflict (id) do nothing;

-- ── Storage RLS ──────────────────────────────────────────────────
create policy "catch-photos: 認証済みユーザーはアップロード可"
  on storage.objects for insert
  with check (
    bucket_id = 'catch-photos'
    and auth.role() = 'authenticated'
  );

create policy "catch-photos: 誰でも閲覧可"
  on storage.objects for select
  using (bucket_id = 'catch-photos');

create policy "catch-photos: 自分のファイルのみ削除可"
  on storage.objects for delete
  using (
    bucket_id = 'catch-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
