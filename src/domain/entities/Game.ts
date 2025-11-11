import { GameId } from '@domain/value-objects/GameId';
import { UserId } from '@domain/value-objects/UserId';
import {
  GameStatus,
  GamePhase,
  ContractType,
  Bid,
  Declaration,
  Trick,
  MATCH_POINTS_TO_WIN,
} from '@domain/types/GameTypes';

export interface GameProps {
  id?: string;
  team1Player1Id: string;
  team1Player2Id: string;
  team2Player1Id: string;
  team2Player2Id: string;
  status?: GameStatus;
  phase?: GamePhase;
  currentDealerIndex?: number;
  currentPlayerIndex?: number;
  team1MatchPoints?: number;
  team2MatchPoints?: number;
  createdAt?: Date;
  finishedAt?: Date | null;
}

export class Game {
  private readonly id: GameId;
  private readonly team1Player1Id: UserId;
  private readonly team1Player2Id: UserId;
  private readonly team2Player1Id: UserId;
  private readonly team2Player2Id: UserId;
  private status: GameStatus;
  private phase: GamePhase;
  private currentDealerIndex: number;
  private currentPlayerIndex: number;
  private team1MatchPoints: number;
  private team2MatchPoints: number;
  private readonly createdAt: Date;
  private finishedAt: Date | null;

  private constructor(props: Required<GameProps>) {
    this.id = GameId.create(props.id);
    this.team1Player1Id = UserId.create(props.team1Player1Id);
    this.team1Player2Id = UserId.create(props.team1Player2Id);
    this.team2Player1Id = UserId.create(props.team2Player1Id);
    this.team2Player2Id = UserId.create(props.team2Player2Id);
    this.status = props.status;
    this.phase = props.phase;
    this.currentDealerIndex = props.currentDealerIndex;
    this.currentPlayerIndex = props.currentPlayerIndex;
    this.team1MatchPoints = props.team1MatchPoints;
    this.team2MatchPoints = props.team2MatchPoints;
    this.createdAt = props.createdAt;
    this.finishedAt = props.finishedAt;
  }

  public static create(props: GameProps): Game {
    return new Game({
      id: props.id || GameId.create().getValue(),
      team1Player1Id: props.team1Player1Id,
      team1Player2Id: props.team1Player2Id,
      team2Player1Id: props.team2Player1Id,
      team2Player2Id: props.team2Player2Id,
      status: props.status ?? GameStatus.WAITING,
      phase: props.phase ?? GamePhase.DEALING,
      currentDealerIndex: props.currentDealerIndex ?? 0,
      currentPlayerIndex: props.currentPlayerIndex ?? 1,
      team1MatchPoints: props.team1MatchPoints ?? 0,
      team2MatchPoints: props.team2MatchPoints ?? 0,
      createdAt: props.createdAt ?? new Date(),
      finishedAt: props.finishedAt ?? null,
    });
  }

  // Getters
  public getId(): GameId {
    return this.id;
  }

  public getPlayerIds(): UserId[] {
    return [this.team1Player1Id, this.team2Player1Id, this.team1Player2Id, this.team2Player2Id];
  }

  public getTeam1PlayerIds(): UserId[] {
    return [this.team1Player1Id, this.team1Player2Id];
  }

  public getTeam2PlayerIds(): UserId[] {
    return [this.team2Player1Id, this.team2Player2Id];
  }

  public getStatus(): GameStatus {
    return this.status;
  }

  public getPhase(): GamePhase {
    return this.phase;
  }

  public getCurrentDealerIndex(): number {
    return this.currentDealerIndex;
  }

  public getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }

  public getTeam1MatchPoints(): number {
    return this.team1MatchPoints;
  }

  public getTeam2MatchPoints(): number {
    return this.team2MatchPoints;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getFinishedAt(): Date | null {
    return this.finishedAt;
  }

  // Business logic
  public start(): void {
    if (this.status !== GameStatus.WAITING) {
      throw new Error('Game can only be started from WAITING status');
    }
    this.status = GameStatus.ACTIVE;
    this.phase = GamePhase.DEALING;
  }

  public setPhase(phase: GamePhase): void {
    this.phase = phase;
  }

  public nextPlayer(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 4;
  }

  public nextDealer(): void {
    this.currentDealerIndex = (this.currentDealerIndex + 1) % 4;
    this.currentPlayerIndex = (this.currentDealerIndex + 1) % 4;
  }

  public addMatchPoints(team: 1 | 2, points: number): void {
    if (team === 1) {
      this.team1MatchPoints += points;
    } else {
      this.team2MatchPoints += points;
    }
  }

  public isFinished(): boolean {
    return (
      this.team1MatchPoints >= MATCH_POINTS_TO_WIN ||
      this.team2MatchPoints >= MATCH_POINTS_TO_WIN
    );
  }

  public getWinningTeam(): 1 | 2 | null {
    if (!this.isFinished()) return null;
    return this.team1MatchPoints > this.team2MatchPoints ? 1 : 2;
  }

  public finish(): void {
    if (this.status === GameStatus.COMPLETED) {
      throw new Error('Game is already completed');
    }
    this.status = GameStatus.COMPLETED;
    this.phase = GamePhase.FINISHED;
    this.finishedAt = new Date();
  }

  public cancel(): void {
    this.status = GameStatus.CANCELLED;
    this.finishedAt = new Date();
  }

  public isPlayerInGame(playerId: UserId): boolean {
    return this.getPlayerIds().some(id => id.equals(playerId));
  }

  public getPlayerTeam(playerId: UserId): 1 | 2 {
    if (
      this.team1Player1Id.equals(playerId) ||
      this.team1Player2Id.equals(playerId)
    ) {
      return 1;
    }
    return 2;
  }

  public toJSON() {
    return {
      id: this.id.getValue(),
      team1: {
        player1Id: this.team1Player1Id.getValue(),
        player2Id: this.team1Player2Id.getValue(),
        matchPoints: this.team1MatchPoints,
      },
      team2: {
        player1Id: this.team2Player1Id.getValue(),
        player2Id: this.team2Player2Id.getValue(),
        matchPoints: this.team2MatchPoints,
      },
      status: this.status,
      phase: this.phase,
      currentDealerIndex: this.currentDealerIndex,
      currentPlayerIndex: this.currentPlayerIndex,
      createdAt: this.createdAt.toISOString(),
      finishedAt: this.finishedAt?.toISOString() || null,
    };
  }
}
