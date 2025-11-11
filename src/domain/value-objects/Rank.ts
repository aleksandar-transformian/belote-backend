export enum RankType {
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A',
}

export class Rank {
  private readonly value: RankType;

  private constructor(value: RankType) {
    this.value = value;
  }

  public static create(value: RankType): Rank {
    return new Rank(value);
  }

  public static fromString(value: string): Rank {
    const upperValue = value.toUpperCase();
    const rank = Object.values(RankType).find(r => r === upperValue);
    if (!rank) {
      throw new Error(`Invalid rank: ${value}`);
    }
    return new Rank(rank);
  }

  public getValue(): RankType {
    return this.value;
  }

  public equals(other: Rank): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  // Trump suit order: J > 9 > A > 10 > K > Q > 8 > 7
  public getTrumpOrder(): number {
    const order: Record<RankType, number> = {
      [RankType.JACK]: 8,
      [RankType.NINE]: 7,
      [RankType.ACE]: 6,
      [RankType.TEN]: 5,
      [RankType.KING]: 4,
      [RankType.QUEEN]: 3,
      [RankType.EIGHT]: 2,
      [RankType.SEVEN]: 1,
    };
    return order[this.value];
  }

  // Non-trump suit order: A > 10 > K > Q > J > 9 > 8 > 7
  public getNonTrumpOrder(): number {
    const order: Record<RankType, number> = {
      [RankType.ACE]: 8,
      [RankType.TEN]: 7,
      [RankType.KING]: 6,
      [RankType.QUEEN]: 5,
      [RankType.JACK]: 4,
      [RankType.NINE]: 3,
      [RankType.EIGHT]: 2,
      [RankType.SEVEN]: 1,
    };
    return order[this.value];
  }
}
