import { redis } from "../config/redis";
import { logger } from "../config/logger";

const DEFAULT_TTL_SECONDS = 60;

/**
 * Thin cache-aside wrapper. Every method fails open (logs + returns a
 * no-op) if Redis is unreachable, so caching is a performance layer, never
 * a hard dependency for correctness.
 */
export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      logger.warn(`Cache get failed for ${key}: ${(err as Error).message}`);
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      logger.warn(`Cache set failed for ${key}: ${(err as Error).message}`);
    }
  },

  /** Deletes every key under a prefix (used to invalidate list caches on writes). */
  async invalidatePrefix(prefix: string): Promise<void> {
    try {
      const keys = await redis.keys(`${prefix}*`);
      if (keys.length > 0) await redis.del(...keys);
    } catch (err) {
      logger.warn(`Cache invalidation failed for prefix ${prefix}: ${(err as Error).message}`);
    }
  },
};
