import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttlSeconds ? ttlSeconds * 1000 : undefined);
  }

  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get<T>(key);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
