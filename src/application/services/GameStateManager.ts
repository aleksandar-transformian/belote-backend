import { GameId } from '@domain/value-objects/GameId';
import { RedisService } from '@infrastructure/redis/RedisService';
import { Card } from '@domain/entities/Card';

export interface GameSessionState {
  gameId: string;
  phase: string;
  currentPlayerIndex: number;
  currentDealerIndex: number;
  trumpSuit: string | null;
  contract: string | null;
  currentTrick: Array<{ playerId: string; card: any }>;
  bids: Array<any>;
  team1Score: number;
  team2Score: number;
  roundNumber: number;
}

export class GameStateManager {
  public static async saveGameState(gameId: string, state: GameSessionState): Promise<void> {
    await RedisService.setGameState(gameId, state);
  }

  public static async getGameState(gameId: string): Promise<GameSessionState | null> {
    return await RedisService.getGameState(gameId);
  }

  public static async savePlayerHand(gameId: string, playerId: string, cards: Card[]): Promise<void> {
    const serialized = cards.map(c => c.toJSON());
    await RedisService.setPlayerHand(gameId, playerId, serialized);
  }

  public static async getPlayerHand(gameId: string, playerId: string): Promise<Card[] | null> {
    const data = await RedisService.getPlayerHand(gameId, playerId);
    if (!data) return null;
    return data.map(c => Card.create(c));
  }

  public static async removeCard(gameId: string, playerId: string, card: Card): Promise<void> {
    const hand = await this.getPlayerHand(gameId, playerId);
    if (!hand) return;

    const filtered = hand.filter(c => !c.equals(card));
    await this.savePlayerHand(gameId, playerId, filtered);
  }
}
