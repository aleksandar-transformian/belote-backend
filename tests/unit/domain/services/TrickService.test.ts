import { TrickService, PlayedCard } from '@domain/services/TrickService';
import { Card } from '@domain/entities/Card';
import { Suit, SuitType } from '@domain/value-objects/Suit';
import { RankType } from '@domain/value-objects/Rank';

describe('TrickService', () => {
  describe('isValidPlay', () => {
    it('should allow any card as first play', () => {
      const card = Card.create({ suit: SuitType.HEARTS, rank: RankType.SEVEN });
      const hand = [card];
      const currentTrick: PlayedCard[] = [];
      const trumpSuit = Suit.create(SuitType.SPADES);

      const isValid = TrickService.isValidPlay(card, hand, currentTrick, trumpSuit, 2, 0);
      expect(isValid).toBe(true);
    });

    it('should require following suit if possible', () => {
      const leadCard = Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE });
      const playCard = Card.create({ suit: SuitType.CLUBS, rank: RankType.KING });
      const heartCard = Card.create({ suit: SuitType.HEARTS, rank: RankType.SEVEN });

      const hand = [playCard, heartCard];
      const currentTrick: PlayedCard[] = [
        { playerId: 'p1', card: leadCard },
      ];
      const trumpSuit = Suit.create(SuitType.SPADES);

      const isValid = TrickService.isValidPlay(playCard, hand, currentTrick, trumpSuit, 2, 1);
      expect(isValid).toBe(false);
    });

    it('should allow playing different suit if cannot follow', () => {
      const leadCard = Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE });
      const playCard = Card.create({ suit: SuitType.CLUBS, rank: RankType.KING });

      const hand = [playCard];
      const currentTrick: PlayedCard[] = [
        { playerId: 'p1', card: leadCard },
      ];
      const trumpSuit = Suit.create(SuitType.SPADES);

      const isValid = TrickService.isValidPlay(playCard, hand, currentTrick, trumpSuit, 2, 1);
      expect(isValid).toBe(true);
    });

    it('should not allow card not in hand', () => {
      const card = Card.create({ suit: SuitType.HEARTS, rank: RankType.SEVEN });
      const hand = [Card.create({ suit: SuitType.CLUBS, rank: RankType.KING })];
      const currentTrick: PlayedCard[] = [];
      const trumpSuit = Suit.create(SuitType.SPADES);

      const isValid = TrickService.isValidPlay(card, hand, currentTrick, trumpSuit, 2, 0);
      expect(isValid).toBe(false);
    });
  });

  describe('getTrickWinner', () => {
    it('should return winner when trump beats non-trump', () => {
      const trumpSuit = Suit.create(SuitType.SPADES);
      const trick: PlayedCard[] = [
        { playerId: 'p1', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE }) },
        { playerId: 'p2', card: Card.create({ suit: SuitType.SPADES, rank: RankType.SEVEN }) },
      ];

      const winner = TrickService.getTrickWinner(trick, trumpSuit);
      expect(winner?.playerId).toBe('p2');
    });

    it('should return winner when higher trump beats lower trump', () => {
      const trumpSuit = Suit.create(SuitType.SPADES);
      const trick: PlayedCard[] = [
        { playerId: 'p1', card: Card.create({ suit: SuitType.SPADES, rank: RankType.SEVEN }) },
        { playerId: 'p2', card: Card.create({ suit: SuitType.SPADES, rank: RankType.JACK }) },
      ];

      const winner = TrickService.getTrickWinner(trick, trumpSuit);
      expect(winner?.playerId).toBe('p2');
    });

    it('should return winner when following lead suit', () => {
      const trumpSuit = Suit.create(SuitType.SPADES);
      const trick: PlayedCard[] = [
        { playerId: 'p1', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.SEVEN }) },
        { playerId: 'p2', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE }) },
        { playerId: 'p3', card: Card.create({ suit: SuitType.CLUBS, rank: RankType.ACE }) },
      ];

      const winner = TrickService.getTrickWinner(trick, trumpSuit);
      expect(winner?.playerId).toBe('p2');
    });
  });

  describe('calculateTrickPoints', () => {
    it('should calculate total points for trick', () => {
      const trumpSuit = Suit.create(SuitType.SPADES);
      const trick: PlayedCard[] = [
        { playerId: 'p1', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE }) },
        { playerId: 'p2', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.TEN }) },
        { playerId: 'p3', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.KING }) },
        { playerId: 'p4', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.SEVEN }) },
      ];

      const points = TrickService.calculateTrickPoints(trick, trumpSuit);
      // ACE (11) + TEN (10) + KING (4) + SEVEN (0) = 25
      expect(points).toBe(25);
    });
  });
});
