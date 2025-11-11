import { Game } from '@domain/entities/Game';
import { GameId } from '@domain/value-objects/GameId';
import { UserId } from '@domain/value-objects/UserId';
import { GameStatus } from '@domain/types/GameTypes';

export interface IGameRepository {
  save(game: Game): Promise<Game>;
  findById(id: GameId): Promise<Game | null>;
  findByPlayerId(playerId: UserId): Promise<Game[]>;
  findByStatus(status: GameStatus): Promise<Game[]>;
  update(game: Game): Promise<Game>;
  delete(id: GameId): Promise<void>;
}
