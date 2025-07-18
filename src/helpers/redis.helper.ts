import Cache from '../configs/cache.config';
import { Redis } from 'ioredis';

class RedisHelper {
  private static instance: RedisHelper;
  private redisClient: Redis;

  private constructor() {
    const cacheInstance = new Cache();
    this.redisClient = cacheInstance.getCache();
  }

  public static getInstance(): RedisHelper {
    if (!RedisHelper.instance) {
      RedisHelper.instance = new RedisHelper();
    }
    return RedisHelper.instance;
  }

  /**
   * Stores data in Redis.
   * @param key The key to store the data under.
   * @param value The data to store. Can be any type, will be JSON.stringified.
   * @param ttl Optional time-to-live in seconds.
   */
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redisClient.setex(key, ttl, serializedValue);
      } else {
        await this.redisClient.set(key, serializedValue);
      }
      console.log(`Data set for key: ${key}`);
    } catch (error) {
      console.error(`Error setting data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves data from Redis.
   * @param key The key of the data to retrieve.
   * @returns The retrieved data, parsed from JSON, or null if not found.
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Deletes data from Redis.
   * @param key The key of the data to delete.
   */
  public async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
      console.log(`Data deleted for key: ${key}`);
    } catch (error) {
      console.error(`Error deleting data for key ${key}:`, error);
      throw error;
    }
  }
}

export const redisHelper = RedisHelper.getInstance();
