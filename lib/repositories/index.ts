/**
 * lib/repositories/index.ts — リポジトリ層
 *
 * 抽象インターフェースと静的実装を同ファイルに置く。
 * Supabase 移行時は StaticXxxRepository を SupabaseXxxRepository に差し替えるだけ。
 *
 * 使い方:
 *   import { spotRepo, fishRepo } from "@/lib/repositories"
 *   const spot = await spotRepo.findById("chigasaki-surf")
 */

import type {
  Spot,
  Fish,
  Region,
  CatchLog,
  DailyForecastRecord,
} from "@/lib/types/domain";

import { SHONAN_SPOTS, getSpotById } from "@/data/spots/shonan";
import { FISH_MASTER, getFishById } from "@/data/fish/index";
import { REGIONS, getRegionById } from "@/data/regions/index";

/* ══════════════════════════════════════════════════
   INTERFACES — ここが契約。実装はすり替え可能。
══════════════════════════════════════════════════ */

export interface SpotRepository {
  findAll(): Promise<Spot[]>;
  findById(id: string): Promise<Spot | null>;
  findByRegion(regionId: string): Promise<Spot[]>;
}

export interface FishRepository {
  findAll(): Promise<Fish[]>;
  findById(id: string): Promise<Fish | null>;
  findByName(name: string): Promise<Fish | null>;
}

export interface RegionRepository {
  findAll(): Promise<Region[]>;
  findActive(): Promise<Region[]>;
  findById(id: string): Promise<Region | null>;
}

export interface CatchLogRepository {
  findPublicRecent(limit?: number): Promise<CatchLog[]>;
  findByUser(userId: string): Promise<CatchLog[]>;
  findBySpot(spotId: string, days?: number): Promise<CatchLog[]>;
  create(log: Omit<CatchLog, "id" | "createdAt">): Promise<CatchLog>;
  softDelete(id: string, userId: string): Promise<void>;
}

export interface ForecastRepository {
  findBySpotAndDate(spotId: string, date: string): Promise<DailyForecastRecord | null>;
  upsert(forecast: DailyForecastRecord): Promise<void>;
}

/* ══════════════════════════════════════════════════
   STATIC IMPLEMENTATIONS（現在の実装）
   サーバー不要、ビルド時データ埋め込み。
══════════════════════════════════════════════════ */

class StaticSpotRepository implements SpotRepository {
  async findAll(): Promise<Spot[]> {
    return SHONAN_SPOTS.filter((s) => s.active);
  }

  async findById(id: string): Promise<Spot | null> {
    return getSpotById(id) ?? null;
  }

  async findByRegion(regionId: string): Promise<Spot[]> {
    return SHONAN_SPOTS.filter((s) => s.regionId === regionId && s.active);
  }
}

class StaticFishRepository implements FishRepository {
  async findAll(): Promise<Fish[]> {
    return FISH_MASTER;
  }

  async findById(id: string): Promise<Fish | null> {
    return getFishById(id) ?? null;
  }

  async findByName(name: string): Promise<Fish | null> {
    return FISH_MASTER.find((f) => f.name === name) ?? null;
  }
}

class StaticRegionRepository implements RegionRepository {
  async findAll(): Promise<Region[]> {
    return REGIONS;
  }

  async findActive(): Promise<Region[]> {
    return REGIONS.filter((r) => r.active);
  }

  async findById(id: string): Promise<Region | null> {
    return getRegionById(id) ?? null;
  }
}

/** CatchLog は将来 Supabase 実装のみ。現在はモックを返す。 */
class MockCatchLogRepository implements CatchLogRepository {
  async findPublicRecent(limit = 10): Promise<CatchLog[]> {
    return [];
  }

  async findByUser(_userId: string): Promise<CatchLog[]> {
    return [];
  }

  async findBySpot(_spotId: string, _days = 7): Promise<CatchLog[]> {
    return [];
  }

  async create(log: Omit<CatchLog, "id" | "createdAt">): Promise<CatchLog> {
    return {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
  }

  async softDelete(_id: string, _userId: string): Promise<void> {
    // no-op until Supabase
  }
}

class MockForecastRepository implements ForecastRepository {
  private cache = new Map<string, DailyForecastRecord>();

  async findBySpotAndDate(
    spotId: string,
    date: string
  ): Promise<DailyForecastRecord | null> {
    return this.cache.get(`${spotId}:${date}`) ?? null;
  }

  async upsert(forecast: DailyForecastRecord): Promise<void> {
    this.cache.set(`${forecast.spotId}:${forecast.date}`, forecast);
  }
}

/* ══════════════════════════════════════════════════
   SINGLETON EXPORTS
   アプリ全体でここをインポートして使う。
   Supabase 移行時はここの実装クラスを差し替えるだけ。
══════════════════════════════════════════════════ */

export const spotRepo: SpotRepository       = new StaticSpotRepository();
export const fishRepo: FishRepository       = new StaticFishRepository();
export const regionRepo: RegionRepository   = new StaticRegionRepository();
export const catchLogRepo: CatchLogRepository = new MockCatchLogRepository();
export const forecastRepo: ForecastRepository = new MockForecastRepository();
