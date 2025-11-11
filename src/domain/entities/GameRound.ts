import { GameId } from '@domain/value-objects/GameId';
import { UserId } from '@domain/value-objects/UserId';
import { Suit, SuitType } from '@domain/value-objects/Suit';
import { ContractType, Bid, Declaration, Trick } from '@domain/types/GameTypes';

export interface GameRoundProps {
  id?: string;
  gameId: string;
  roundNumber: number;
  dealerId: string;
  trumpSuit?: SuitType | null;
  contractType?: ContractType | null;
  contractTeam?: 1 | 2 | null;
  isDoubled?: boolean;
  isRedoubled?: boolean;
  team1RoundPoints?: number;
  team2RoundPoints?: number;
  team1Declarations?: Declaration[];
  team2Declarations?: Declaration[];
  tricks?: Trick[];
  winnerTeam?: 1 | 2 | null;
  createdAt?: Date;
  finishedAt?: Date | null;
}

export class GameRound {
  private readonly id: string;
  private readonly gameId: GameId;
  private readonly roundNumber: number;
  private readonly dealerId: UserId;
  private trumpSuit: Suit | null;
  private contractType: ContractType | null;
  private contractTeam: 1 | 2 | null;
  private isDoubled: boolean;
  private isRedoubled: boolean;
  private team1RoundPoints: number;
  private team2RoundPoints: number;
  private team1Declarations: Declaration[];
  private team2Declarations: Declaration[];
  private tricks: Trick[];
  private winnerTeam: 1 | 2 | null;
  private readonly createdAt: Date;
  private finishedAt: Date | null;

  private constructor(props: Required<GameRoundProps>) {
    this.id = props.id;
    this.gameId = GameId.create(props.gameId);
    this.roundNumber = props.roundNumber;
    this.dealerId = UserId.create(props.dealerId);
    this.trumpSuit = props.trumpSuit ? Suit.fromString(props.trumpSuit) : null;
    this.contractType = props.contractType;
    this.contractTeam = props.contractTeam;
    this.isDoubled = props.isDoubled;
    this.isRedoubled = props.isRedoubled;
    this.team1RoundPoints = props.team1RoundPoints;
    this.team2RoundPoints = props.team2RoundPoints;
    this.team1Declarations = props.team1Declarations;
    this.team2Declarations = props.team2Declarations;
    this.tricks = props.tricks;
    this.winnerTeam = props.winnerTeam;
    this.createdAt = props.createdAt;
    this.finishedAt = props.finishedAt;
  }

  public static create(props: GameRoundProps): GameRound {
    return new GameRound({
      id: props.id || crypto.randomUUID(),
      gameId: props.gameId,
      roundNumber: props.roundNumber,
      dealerId: props.dealerId,
      trumpSuit: props.trumpSuit ?? null,
      contractType: props.contractType ?? null,
      contractTeam: props.contractTeam ?? null,
      isDoubled: props.isDoubled ?? false,
      isRedoubled: props.isRedoubled ?? false,
      team1RoundPoints: props.team1RoundPoints ?? 0,
      team2RoundPoints: props.team2RoundPoints ?? 0,
      team1Declarations: props.team1Declarations ?? [],
      team2Declarations: props.team2Declarations ?? [],
      tricks: props.tricks ?? [],
      winnerTeam: props.winnerTeam ?? null,
      createdAt: props.createdAt ?? new Date(),
      finishedAt: props.finishedAt ?? null,
    });
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getGameId(): GameId {
    return this.gameId;
  }

  public getRoundNumber(): number {
    return this.roundNumber;
  }

  public getTrumpSuit(): Suit | null {
    return this.trumpSuit;
  }

  public getContractType(): ContractType | null {
    return this.contractType;
  }

  public getTricks(): Trick[] {
    return this.tricks;
  }

  // Business logic
  public setContract(contract: ContractType, team: 1 | 2, isDoubled: boolean = false, isRedoubled: boolean = false): void {
    this.contractType = contract;
    this.contractTeam = team;
    this.isDoubled = isDoubled;
    this.isRedoubled = isRedoubled;

    // Set trump suit based on contract
    if (contract !== ContractType.NO_TRUMPS && contract !== ContractType.ALL_TRUMPS) {
      this.trumpSuit = Suit.fromString(contract);
    }
  }

  public addTrick(trick: Trick): void {
    this.tricks.push(trick);
  }

  public setScore(team1Points: number, team2Points: number, winnerTeam: 1 | 2): void {
    this.team1RoundPoints = team1Points;
    this.team2RoundPoints = team2Points;
    this.winnerTeam = winnerTeam;
    this.finishedAt = new Date();
  }

  public addDeclaration(declaration: Declaration, team: 1 | 2): void {
    if (team === 1) {
      this.team1Declarations.push(declaration);
    } else {
      this.team2Declarations.push(declaration);
    }
  }

  public toJSON() {
    return {
      id: this.id,
      gameId: this.gameId.getValue(),
      roundNumber: this.roundNumber,
      dealerId: this.dealerId.getValue(),
      trumpSuit: this.trumpSuit?.getValue() || null,
      contractType: this.contractType,
      contractTeam: this.contractTeam,
      isDoubled: this.isDoubled,
      isRedoubled: this.isRedoubled,
      team1RoundPoints: this.team1RoundPoints,
      team2RoundPoints: this.team2RoundPoints,
      team1Declarations: this.team1Declarations,
      team2Declarations: this.team2Declarations,
      tricks: this.tricks,
      winnerTeam: this.winnerTeam,
      createdAt: this.createdAt.toISOString(),
      finishedAt: this.finishedAt?.toISOString() || null,
    };
  }
}
