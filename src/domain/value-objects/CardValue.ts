import { RankType } from './Rank';

export class CardValue {
  private readonly trumpValue: number;
  private readonly nonTrumpValue: number;

  private constructor(trumpValue: number, nonTrumpValue: number) {
    this.trumpValue = trumpValue;
    this.nonTrumpValue = nonTrumpValue;
  }

  public static create(rank: RankType): CardValue {
    const values = this.getValues(rank);
    return new CardValue(values.trump, values.nonTrump);
  }

  private static getValues(rank: RankType): { trump: number; nonTrump: number } {
    const valueMap: Record<RankType, { trump: number; nonTrump: number }> = {
      [RankType.JACK]: { trump: 20, nonTrump: 2 },
      [RankType.NINE]: { trump: 14, nonTrump: 0 },
      [RankType.ACE]: { trump: 11, nonTrump: 11 },
      [RankType.TEN]: { trump: 10, nonTrump: 10 },
      [RankType.KING]: { trump: 4, nonTrump: 4 },
      [RankType.QUEEN]: { trump: 3, nonTrump: 3 },
      [RankType.EIGHT]: { trump: 0, nonTrump: 0 },
      [RankType.SEVEN]: { trump: 0, nonTrump: 0 },
    };
    return valueMap[rank];
  }

  public getTrumpValue(): number {
    return this.trumpValue;
  }

  public getNonTrumpValue(): number {
    return this.nonTrumpValue;
  }

  public getValue(isTrump: boolean): number {
    return isTrump ? this.trumpValue : this.nonTrumpValue;
  }
}
