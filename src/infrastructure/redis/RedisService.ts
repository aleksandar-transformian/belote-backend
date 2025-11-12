import Redis from 'ioredis';
import { config } from '@infrastructure/config';
import { logger } from '@shared/utils/logger';

export class RedisService {
  private static instance: Redis;

  public static getInstance(): Redis {
    if (!RedisService.instance) {
      RedisService.instance = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        db: config.redis.db,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      RedisService.instance.on('connect', () => {
        logger.info('Redis connected');
      });

      RedisService.instance.on('error', (err) => {
        logger.error('Redis error', { error: err.message });
      });
    }

    return RedisService.instance;
  }

  public static async setGameState(gameId: string, state: any, ttl: number = 3600): Promise<void> {
    const redis = RedisService.getInstance();
    await redis.setex(`game:${gameId}:state`, ttl, JSON.stringify(state));
  }

  public static async getGameState(gameId: string): Promise<any | null> {
    const redis = RedisService.getInstance();
    const data = await redis.get(`game:${gameId}:state`);
    return data ? JSON.parse(data) : null;
  }

  public static async setPlayerHand(gameId: string, playerId: string, cards: any[]): Promise<void> {
    const redis = RedisService.getInstance();
    await redis.setex(`game:${gameId}:hand:${playerId}`, 3600, JSON.stringify(cards));
  }

  public static async getPlayerHand(gameId: string, playerId: string): Promise<any[] | null> {
    const redis = RedisService.getInstance();
    const data = await redis.get(`game:${gameId}:hand:${playerId}`);
    return data ? JSON.parse(data) : null;
  }

  public static async addToMatchmakingQueue(userId: string, eloRating: number): Promise<void> {
    const redis = RedisService.getInstance();
    await redis.zadd('matchmaking:queue', eloRating, userId);
    await redis.setex(`matchmaking:user:${userId}`, 300, Date.now().toString());
  }

  public static async removeFromMatchmakingQueue(userId: string): Promise<void> {
    const redis = RedisService.getInstance();
    await redis.zrem('matchmaking:queue', userId);
    await redis.del(`matchmaking:user:${userId}`);
  }

  public static async getMatchmakingCandidates(eloRating: number, count: number = 20): Promise<string[]> {
    const redis = RedisService.getInstance();
    const range = 200; // ELO range
    const members = await redis.zrangebyscore(
      'matchmaking:queue',
      eloRating - range,
      eloRating + range,
      'LIMIT', 0, count
    );
    return members;
  }

  public static async setSocketSession(userId: string, socketId: string): Promise<void> {
    const redis = RedisService.getInstance();
    await redis.setex(`socket:user:${userId}`, 86400, socketId);
    await redis.setex(`socket:id:${socketId}`, 86400, userId);
  }

  public static async getSocketIdForUser(userId: string): Promise<string | null> {
    const redis = RedisService.getInstance();
    return await redis.get(`socket:user:${userId}`);
  }

  public static async getUserIdForSocket(socketId: string): Promise<string | null> {
    const redis = RedisService.getInstance();
    return await redis.get(`socket:id:${socketId}`);
  }

  public static async deleteSocketSession(socketId: string): Promise<void> {
    const redis = RedisService.getInstance();
    const userId = await redis.get(`socket:id:${socketId}`);
    if (userId) {
      await redis.del(`socket:user:${userId}`);
    }
    await redis.del(`socket:id:${socketId}`);
  }
}
