import { Suit, SuitType } from '@domain/value-objects/Suit';
import { Rank, RankType } from '@domain/value-objects/Rank';
import { CardValue } from '@domain/value-objects/CardValue';

export interface CardProps {
  suit: SuitType;
  rank: RankType;
}

export class Card {
  private readonly suit: Suit;
  private readonly rank: Rank;
  private readonly value: CardValue;

  private constructor(suit: Suit, rank: Rank) {
    this.suit = suit;
    this.rank = rank;
    this.value = CardValue.create(rank.getValue());
  }

  public static create(props: CardProps): Card {
    const suit = Suit.create(props.suit);
    const rank = Rank.create(props.rank);
    return new Card(suit, rank);
  }

  public getSuit(): Suit {
    return this.suit;
  }

  public getRank(): Rank {
    return this.rank;
  }

  public getValue(isTrump: boolean): number {
    return this.value.getValue(isTrump);
  }

  public isTrump(trumpSuit: Suit | null): boolean {
    if (!trumpSuit) return false;
    return this.suit.equals(trumpSuit);
  }

  public equals(other: Card): boolean {
    return this.suit.equals(other.suit) && this.rank.equals(other.rank);
  }

  public toString(): string {
    return `${this.rank.toString()}${this.suit.getSymbol()}`;
  }

  public toJSON(): CardProps {
    return {
      suit: this.suit.getValue(),
      rank: this.rank.getValue(),
    };
  }
}
