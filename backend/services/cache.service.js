const Redis = require('ioredis');
const logger = require('../utils/logger');

// Initialize Redis only if Redis URL / Host is provided
let redis = null;
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

try {
    redis = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        }
    });

    redis.on('error', (err) => {
        logger.error('Redis Client Error', err);
    });

    redis.on('connect', () => {
        logger.info('Connected to Redis server successfully');
    });
} catch (error) {
    logger.error('Failed to initialize Redis', error);
}

const getCache = async (key) => {
    if (!redis) return null;
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        logger.error(`Redis Get Error for key ${key}`, err);
        return null;
    }
};

const setCache = async (key, value, ttlSeconds = 60) => {
    if (!redis) return;
    try {
        await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
        logger.error(`Redis Set Error for key ${key}`, err);
    }
};

const invalidateCache = async (key) => {
    if (!redis) return;
    try {
        await redis.del(key);
        logger.info(`Cache invalidated for key ${key}`);
    } catch (err) {
        logger.error(`Redis Invalidate Error for key ${key}`, err);
    }
};

const isHealthy = async () => {
    if (!redis) return false;
    try {
        const res = await redis.ping();
        return res === 'PONG';
    } catch (err) {
        return false;
    }
};

module.exports = {
    getCache,
    setCache,
    invalidateCache,
    isHealthy
};
