import { Rank, RankType } from '@domain/value-objects/Rank';

describe('Rank Value Object', () => {
  it('should create rank from RankType', () => {
    const rank = Rank.create(RankType.ACE);
    expect(rank.getValue()).toBe(RankType.ACE);
  });

  it('should create rank from string', () => {
    const rank = Rank.fromString('j');
    expect(rank.getValue()).toBe(RankType.JACK);
  });

  it('should throw error for invalid rank string', () => {
    expect(() => Rank.fromString('invalid')).toThrow('Invalid rank: invalid');
  });

  it('should compare ranks correctly', () => {
    const rank1 = Rank.create(RankType.KING);
    const rank2 = Rank.create(RankType.KING);
    const rank3 = Rank.create(RankType.QUEEN);

    expect(rank1.equals(rank2)).toBe(true);
    expect(rank1.equals(rank3)).toBe(false);
  });

  it('should return correct trump order', () => {
    expect(Rank.create(RankType.JACK).getTrumpOrder()).toBe(8); // Highest
    expect(Rank.create(RankType.NINE).getTrumpOrder()).toBe(7);
    expect(Rank.create(RankType.ACE).getTrumpOrder()).toBe(6);
    expect(Rank.create(RankType.SEVEN).getTrumpOrder()).toBe(1); // Lowest
  });

  it('should return correct non-trump order', () => {
    expect(Rank.create(RankType.ACE).getNonTrumpOrder()).toBe(8); // Highest
    expect(Rank.create(RankType.TEN).getNonTrumpOrder()).toBe(7);
    expect(Rank.create(RankType.KING).getNonTrumpOrder()).toBe(6);
    expect(Rank.create(RankType.SEVEN).getNonTrumpOrder()).toBe(1); // Lowest
  });
});
