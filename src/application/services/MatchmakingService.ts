import { RedisService } from '@infrastructure/redis/RedisService';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Game } from '@domain/entities/Game';
import { UserId } from '@domain/value-objects/UserId';
import { logger } from '@shared/utils/logger';

export class MatchmakingService {
  constructor(private readonly userRepository: IUserRepository) {}

  public async addToQueue(userId: string, eloRating: number): Promise<void> {
    await RedisService.addToMatchmakingQueue(userId, eloRating);
    logger.info('Player added to matchmaking queue', { userId, eloRating });
  }

  public async removeFromQueue(userId: string): Promise<void> {
    await RedisService.removeFromMatchmakingQueue(userId);
    logger.info('Player removed from matchmaking queue', { userId });
  }

  public async findMatch(): Promise<Game | null> {
    // Get all players in queue
    const candidates = await RedisService.getMatchmakingCandidates(1000, 100);

    if (candidates.length < 4) {
      return null;
    }

    // Take first 4 players with similar ELO
    const matchedPlayers = candidates.slice(0, 4);

    // Create game
    const game = Game.create({
      team1Player1Id: matchedPlayers[0],
      team1Player2Id: matchedPlayers[2],
      team2Player1Id: matchedPlayers[1],
      team2Player2Id: matchedPlayers[3],
    });

    // Remove players from queue
    for (const playerId of matchedPlayers) {
      await this.removeFromQueue(playerId);
    }

    logger.info('Match created', {
      gameId: game.getId().getValue(),
      players: matchedPlayers,
    });

    return game;
  }

  public async runMatchmaking(): Promise<void> {
    // Run every 5 seconds
    setInterval(async () => {
      const game = await this.findMatch();
      if (game) {
        // Notify players via Socket.io
        // Save game to database
      }
    }, 5000);
  }
}
