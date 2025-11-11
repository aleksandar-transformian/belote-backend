export enum SuitType {
  CLUBS = 'CLUBS',
  DIAMONDS = 'DIAMONDS',
  HEARTS = 'HEARTS',
  SPADES = 'SPADES',
}

export class Suit {
  private readonly value: SuitType;

  private constructor(value: SuitType) {
    this.value = value;
  }

  public static create(value: SuitType): Suit {
    return new Suit(value);
  }

  public static fromString(value: string): Suit {
    const upperValue = value.toUpperCase();
    if (!Object.values(SuitType).includes(upperValue as SuitType)) {
      throw new Error(`Invalid suit: ${value}`);
    }
    return new Suit(upperValue as SuitType);
  }

  public getValue(): SuitType {
    return this.value;
  }

  public equals(other: Suit): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public getSymbol(): string {
    switch (this.value) {
      case SuitType.CLUBS:
        return '♣';
      case SuitType.DIAMONDS:
        return '♦';
      case SuitType.HEARTS:
        return '♥';
      case SuitType.SPADES:
        return '♠';
    }
  }
}
