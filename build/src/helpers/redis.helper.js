"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisHelper = void 0;
const cache_config_1 = __importDefault(require("../configs/cache.config"));
class RedisHelper {
    constructor() {
        const cacheInstance = new cache_config_1.default();
        this.redisClient = cacheInstance.getCache();
    }
    static getInstance() {
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
    set(key, value, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serializedValue = JSON.stringify(value);
                if (ttl) {
                    yield this.redisClient.setex(key, ttl, serializedValue);
                }
                else {
                    yield this.redisClient.set(key, serializedValue);
                }
                console.log(`Data set for key: ${key}`);
            }
            catch (error) {
                console.error(`Error setting data for key ${key}:`, error);
                throw error;
            }
        });
    }
    /**
     * Retrieves data from Redis.
     * @param key The key of the data to retrieve.
     * @returns The retrieved data, parsed from JSON, or null if not found.
     */
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.redisClient.get(key);
                if (data) {
                    return JSON.parse(data);
                }
                return null;
            }
            catch (error) {
                console.error(`Error getting data for key ${key}:`, error);
                throw error;
            }
        });
    }
    /**
     * Deletes data from Redis.
     * @param key The key of the data to delete.
     */
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redisClient.del(key);
                console.log(`Data deleted for key: ${key}`);
            }
            catch (error) {
                console.error(`Error deleting data for key ${key}:`, error);
                throw error;
            }
        });
    }
}
exports.redisHelper = RedisHelper.getInstance();
