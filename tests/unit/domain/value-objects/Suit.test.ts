import { Suit, SuitType } from '@domain/value-objects/Suit';

describe('Suit Value Object', () => {
  it('should create suit from SuitType', () => {
    const suit = Suit.create(SuitType.HEARTS);
    expect(suit.getValue()).toBe(SuitType.HEARTS);
  });

  it('should create suit from string', () => {
    const suit = Suit.fromString('clubs');
    expect(suit.getValue()).toBe(SuitType.CLUBS);
  });

  it('should throw error for invalid suit string', () => {
    expect(() => Suit.fromString('invalid')).toThrow('Invalid suit: invalid');
  });

  it('should compare suits correctly', () => {
    const suit1 = Suit.create(SuitType.SPADES);
    const suit2 = Suit.create(SuitType.SPADES);
    const suit3 = Suit.create(SuitType.DIAMONDS);

    expect(suit1.equals(suit2)).toBe(true);
    expect(suit1.equals(suit3)).toBe(false);
  });

  it('should return correct symbols', () => {
    expect(Suit.create(SuitType.CLUBS).getSymbol()).toBe('♣');
    expect(Suit.create(SuitType.DIAMONDS).getSymbol()).toBe('♦');
    expect(Suit.create(SuitType.HEARTS).getSymbol()).toBe('♥');
    expect(Suit.create(SuitType.SPADES).getSymbol()).toBe('♠');
  });
});
