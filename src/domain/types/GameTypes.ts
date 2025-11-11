import { SuitType } from '@domain/value-objects/Suit';

export enum GameStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum GamePhase {
  DEALING = 'DEALING',
  BIDDING = 'BIDDING',
  DECLARING = 'DECLARING',
  PLAYING = 'PLAYING',
  SCORING = 'SCORING',
  FINISHED = 'FINISHED',
}

export enum ContractType {
  CLUBS = 'CLUBS',
  DIAMONDS = 'DIAMONDS',
  HEARTS = 'HEARTS',
  SPADES = 'SPADES',
  NO_TRUMPS = 'NO_TRUMPS',
  ALL_TRUMPS = 'ALL_TRUMPS',
}

export enum BidType {
  PASS = 'PASS',
  CONTRACT = 'CONTRACT',
  DOUBLE = 'DOUBLE',
  REDOUBLE = 'REDOUBLE',
}

export enum DeclarationType {
  TIERCE = 'TIERCE', // 3 cards sequence: 20 points
  QUARTE = 'QUARTE', // 4 cards sequence: 50 points
  QUINTE = 'QUINTE', // 5 cards sequence: 100 points
  SQUARE_JACKS = 'SQUARE_JACKS', // 4 Jacks: 200 points
  SQUARE_NINES = 'SQUARE_NINES', // 4 Nines: 150 points
  SQUARE_ACES = 'SQUARE_ACES', // 4 Aces: 100 points
  SQUARE_TENS = 'SQUARE_TENS', // 4 Tens: 100 points
  SQUARE_KINGS = 'SQUARE_KINGS', // 4 Kings: 100 points
  SQUARE_QUEENS = 'SQUARE_QUEENS', // 4 Queens: 100 points
  BELOTE = 'BELOTE', // King + Queen of trump: 20 points
}

export interface Declaration {
  type: DeclarationType;
  cards: string[]; // Card IDs
  points: number;
  playerId: string;
}

export interface Bid {
  playerId: string;
  type: BidType;
  contract?: ContractType;
  timestamp: Date;
}

export interface Trick {
  cards: Array<{
    playerId: string;
    card: string; // Card ID in format: "AS" (Ace of Spades)
  }>;
  winnerId: string;
  points: number;
}

export const MATCH_POINTS_TO_WIN = 151;
export const LAST_TRICK_BONUS = 10;
export const VALAT_BONUS = 9; // Winning all tricks
export const BELOTE_POINTS = 20;
