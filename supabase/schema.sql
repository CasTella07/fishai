-- supabase/schema.sql — FishAI データベーススキーマ（PostgreSQL / Supabase）
--
-- 設計方針
-- - UUID は Supabase の gen_random_uuid() を使用
-- - slug (TEXT) は TypeScript の id と同値。ビジネスロジックはスラッグで参照。
-- - JSONB カラムは TypeScript 型の JSONB 表現（lib/types/domain.ts 参照）
-- - 削除は原則 soft delete (deleted_at)
-- - RLS (Row Level Security) をデフォルト有効化
-- - updated_at は trigger で自動更新
--
-- 実行順序: extensions → functions → tables → indexes → triggers → RLS policies

-- ══════════════════════════════════════════
-- EXTENSIONS
-- ══════════════════════════════════════════

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- LIKE 検索の高速化用

-- ══════════════════════════════════════════
-- HELPER FUNCTIONS
-- ══════════════════════════════════════════

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ══════════════════════════════════════════
-- REGIONS — エリアマスター
-- ══════════════════════════════════════════

create table if not exists regions (
  id            text primary key,        -- slug: "shonan"
  name          text not null,
  name_en       text not null,
  prefecture    text not null,
  description   text,
  lat           double precision not null,
  lng           double precision not null,
  timezone      text not null default 'Asia/Tokyo',
  active        boolean not null default false,
  premium_only  boolean not null default false,
  launch_date   date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger regions_updated_at
  before update on regions
  for each row execute function update_updated_at();

-- ══════════════════════════════════════════
-- FISH — 魚種マスター
-- ══════════════════════════════════════════

create table if not exists fish (
  id                  text primary key,   -- slug: "hirame"
  name                text not null,
  name_en             text not null,
  emoji               text not null,
  category            text not null,      -- "フラット" | "回遊魚" | etc.
  peak_months         int[] not null,     -- 1-12
  habitat_depth       text not null,
  min_legal_size_cm   int,
  category_color      text not null,
  category_bg         text not null,
  beginner_tip        text not null,
  description         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger fish_updated_at
  before update on fish
  for each row execute function update_updated_at();

-- ══════════════════════════════════════════
-- SPOTS — スポット（ポイント）
-- ══════════════════════════════════════════

create table if not exists spots (
  id                  text primary key,   -- slug: "chigasaki-surf"
  region_id           text not null references regions(id),
  name                text not null,
  name_kana           text,
  type                text not null,      -- "surf" | "port" | "shore" | ...
  icon                text not null,

  -- 位置情報
  lat                 double precision not null,
  lng                 double precision not null,
  address             text not null,

  -- アクセス
  access              text not null,
  parking             jsonb not null default '{}',  -- ParkingInfo
  toilet              jsonb not null default '{}',  -- ToiletInfo
  foothold            text not null,                -- FootholdType

  -- 向き不向き
  beginner_friendly   boolean not null default false,
  beginner_note       text,
  crowd_level         text not null default 'medium',

  -- 気象条件
  wind_conditions     jsonb not null default '{}',  -- WindConditions
  tide_conditions     jsonb not null default '{}',  -- TideConditions
  best_hours          jsonb not null default '[]',  -- TimeRange[]

  -- 魚種プロフィール
  fish_profiles       jsonb not null default '[]',  -- SpotFishProfile[]

  -- テキスト情報
  safety_notes        text[] not null default '{}',
  general_notes       text[] not null default '{}',
  nearby_shops        text[] not null default '{}',

  -- メタ
  active              boolean not null default true,
  premium_only        boolean not null default false,
  sort_order          int not null default 0,
  cover_image_url     text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

create index if not exists spots_region_id on spots(region_id);
create index if not exists spots_active on spots(active) where deleted_at is null;
create index if not exists spots_sort_order on spots(sort_order);

create trigger spots_updated_at
  before update on spots
  for each row execute function update_updated_at();

-- ══════════════════════════════════════════
-- USERS (Supabase Auth 拡張テーブル)
-- ══════════════════════════════════════════
-- auth.users は Supabase が管理。ここはプロファイル拡張のみ。

create table if not exists user_profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  plan                text not null default 'free',  -- "free" | "pro" | "premium"
  level               int not null default 1,
  xp                  int not null default 0,
  home_region_id      text references regions(id),
  favorite_spot_ids   text[] not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists user_profiles_plan on user_profiles(plan);

create trigger user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at();

-- 新規ユーザー登録時にプロファイル自動作成
create or replace function create_user_profile_on_signup()
returns trigger language plpgsql security definer as $$
begin
  insert into user_profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function create_user_profile_on_signup();

-- ══════════════════════════════════════════
-- CATCH_LOGS — 釣果記録
-- ══════════════════════════════════════════

create table if not exists catch_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  spot_id         text not null references spots(id),
  fish_id         text not null references fish(id),
  size_cm         numeric(5,1),
  count           int not null default 1,
  caught_at       timestamptz not null,
  method          text,
  lure            text,
  tide_type       text,             -- TideType
  wind_speed_ms   numeric(4,1),
  wind_dir        text,             -- WindDirection
  weather_label   text,
  memo            text,
  photo_url       text,
  is_public       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists catch_logs_user_id on catch_logs(user_id) where deleted_at is null;
create index if not exists catch_logs_spot_id on catch_logs(spot_id) where deleted_at is null;
create index if not exists catch_logs_fish_id on catch_logs(fish_id) where deleted_at is null;
create index if not exists catch_logs_caught_at on catch_logs(caught_at desc) where deleted_at is null;
create index if not exists catch_logs_public on catch_logs(is_public, caught_at desc) where deleted_at is null;

create trigger catch_logs_updated_at
  before update on catch_logs
  for each row execute function update_updated_at();

-- ══════════════════════════════════════════
-- DAILY_FORECASTS — 1日予報キャッシュ
-- ══════════════════════════════════════════

create table if not exists daily_forecasts (
  id                  uuid primary key default gen_random_uuid(),
  spot_id             text not null references spots(id),
  date                date not null,
  go_score            int not null check (go_score between 0 and 100),
  decision_type       text not null,      -- DecisionType
  safety_level        text not null,      -- SafetyLevel
  top_fish_ids        text[] not null default '{}',
  best_window_start   time not null,
  best_window_end     time not null,
  captain_comment     text not null,
  weather             jsonb not null,     -- WeatherSnapshot
  generated_at        timestamptz not null default now(),
  source              text not null default 'computed', -- "computed" | "api"

  unique (spot_id, date)
);

create index if not exists daily_forecasts_spot_date on daily_forecasts(spot_id, date);
create index if not exists daily_forecasts_date on daily_forecasts(date);

-- ══════════════════════════════════════════
-- NOTIFICATION_RULES — 通知設定
-- ══════════════════════════════════════════

create table if not exists notification_rules (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,         -- NotificationType
  spot_id     text references spots(id),
  fish_id     text references fish(id),
  threshold   int check (threshold between 0 and 100),
  enabled     boolean not null default true,
  channel     text not null default 'push',  -- NotificationChannel
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists notification_rules_user_id on notification_rules(user_id);

create trigger notification_rules_updated_at
  before update on notification_rules
  for each row execute function update_updated_at();

-- ══════════════════════════════════════════
-- BOAT_YARDS — 船宿（将来実装）
-- ══════════════════════════════════════════

create table if not exists boat_yards (
  id                uuid primary key default gen_random_uuid(),
  region_id         text not null references regions(id),
  name              text not null,
  phone             text,
  website           text,
  lat               double precision not null,
  lng               double precision not null,
  target_fish_ids   text[] not null default '{}',
  price_min         int not null default 0,
  price_max         int not null default 0,
  active            boolean not null default false,
  premium_partner   boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger boat_yards_updated_at
  before update on boat_yards
  for each row execute function update_updated_at();

-- ══════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════

-- regions, fish, spots, daily_forecasts, boat_yards: 誰でも読める
alter table regions          enable row level security;
alter table fish             enable row level security;
alter table spots            enable row level security;
alter table daily_forecasts  enable row level security;
alter table boat_yards       enable row level security;

create policy "regions read all"         on regions         for select using (true);
create policy "fish read all"            on fish            for select using (true);
create policy "spots read active"        on spots           for select using (deleted_at is null);
create policy "daily_forecasts read all" on daily_forecasts for select using (true);
create policy "boat_yards read active"   on boat_yards      for select using (active = true);

-- user_profiles: 本人のみ読み書き
alter table user_profiles enable row level security;

create policy "user_profiles read own"
  on user_profiles for select
  using (auth.uid() = id);

create policy "user_profiles update own"
  on user_profiles for update
  using (auth.uid() = id);

-- catch_logs: 公開 log は誰でも読める。書き込みは本人のみ。
alter table catch_logs enable row level security;

create policy "catch_logs read public"
  on catch_logs for select
  using (is_public = true and deleted_at is null);

create policy "catch_logs read own"
  on catch_logs for select
  using (auth.uid() = user_id and deleted_at is null);

create policy "catch_logs insert own"
  on catch_logs for insert
  with check (auth.uid() = user_id);

create policy "catch_logs update own"
  on catch_logs for update
  using (auth.uid() = user_id and deleted_at is null);

create policy "catch_logs delete own"
  on catch_logs for update
  using (auth.uid() = user_id)
  with check (deleted_at is not null);

-- notification_rules: 本人のみ
alter table notification_rules enable row level security;

create policy "notification_rules manage own"
  on notification_rules for all
  using (auth.uid() = user_id);

-- ══════════════════════════════════════════
-- VIEWS（便利ビュー）
-- ══════════════════════════════════════════

-- 直近30日の公開釣果（魚種別集計）
create or replace view public_catch_summary as
  select
    fish_id,
    spot_id,
    count(*)           as catch_count,
    avg(size_cm)       as avg_size_cm,
    max(size_cm)       as max_size_cm,
    max(caught_at)     as last_caught_at
  from catch_logs
  where
    is_public = true
    and deleted_at is null
    and caught_at >= now() - interval '30 days'
  group by fish_id, spot_id;
