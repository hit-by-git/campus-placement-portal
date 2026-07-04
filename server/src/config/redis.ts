import Redis from "ioredis";
import { env, isTest } from "./env";
import { logger } from "./logger";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  retryStrategy: () => null, // Don't keep retrying; cache failures should degrade gracefully.
});

redis.on("error", (err) => {
  if (!isTest) logger.warn(`Redis error: ${err.message}`);
});

if (!isTest) {
  redis.connect().catch((err) => logger.warn(`Redis connection failed: ${err.message}`));
}
