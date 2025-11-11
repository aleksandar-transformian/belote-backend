import { TrickService, PlayedCard } from '@domain/services/TrickService';
import { Card } from '@domain/entities/Card';
import { Suit, SuitType } from '@domain/value-objects/Suit';
import { RankType } from '@domain/value-objects/Rank';

describe('TrickService', () => {
  describe('isValidPlay', () => {
    it('should allow any card as first play', () => {
      const card = Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE });
      const hand = [card];
      const currentTrick: PlayedCard[] = [];
      const trumpSuit = Suit.create(SuitType.SPADES);

      const isValid = TrickService.isValidPlay(card, hand, currentTrick, trumpSuit, 2, 0);
      expect(isValid).toBe(true);
    });

    it('should require following suit if possible', () => {
      const leadCard = Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE });
      const cardToPlay = Card.create({ suit: SuitType.CLUBS, rank: RankType.KING });
      const heartCard = Card.create({ suit: SuitType.HEARTS, rank: RankType.SEVEN });
      const hand = [cardToPlay, heartCard];
      const currentTrick: PlayedCard[] = [{ playerId: '1', card: leadCard }];
      const trumpSuit = Suit.create(SuitType.SPADES);

      const isValid = TrickService.isValidPlay(cardToPlay, hand, currentTrick, trumpSuit, 2, 1);
      expect(isValid).toBe(false); // Must play heart if have one
    });

    it('should allow playing different suit if no cards of lead suit', () => {
      const leadCard = Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE });
      const cardToPlay = Card.create({ suit: SuitType.CLUBS, rank: RankType.KING });
      const hand = [cardToPlay];
      const currentTrick: PlayedCard[] = [{ playerId: '1', card: leadCard }];
      const trumpSuit = Suit.create(SuitType.SPADES);

      const isValid = TrickService.isValidPlay(cardToPlay, hand, currentTrick, trumpSuit, 2, 1);
      expect(isValid).toBe(true); // Can play any card if can't follow suit and don't have trump
    });

    it('should reject card not in hand', () => {
      const card = Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE });
      const hand = [Card.create({ suit: SuitType.CLUBS, rank: RankType.KING })];
      const currentTrick: PlayedCard[] = [];
      const trumpSuit = Suit.create(SuitType.SPADES);

      const isValid = TrickService.isValidPlay(card, hand, currentTrick, trumpSuit, 2, 0);
      expect(isValid).toBe(false);
    });
  });

  describe('getTrickWinner', () => {
    it('should return null for empty trick', () => {
      const winner = TrickService.getTrickWinner([], null);
      expect(winner).toBeNull();
    });

    it('should return first player if all follow suit and first is highest', () => {
      const trick: PlayedCard[] = [
        { playerId: '1', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE }) },
        { playerId: '2', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.KING }) },
        { playerId: '3', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.QUEEN }) },
      ];

      const winner = TrickService.getTrickWinner(trick, null);
      expect(winner?.playerId).toBe('1');
    });

    it('should return player with highest card in lead suit', () => {
      const trick: PlayedCard[] = [
        { playerId: '1', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.SEVEN }) },
        { playerId: '2', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE }) },
        { playerId: '3', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.KING }) },
      ];

      const winner = TrickService.getTrickWinner(trick, null);
      expect(winner?.playerId).toBe('2');
    });

    it('should give trump card priority over non-trump', () => {
      const trumpSuit = Suit.create(SuitType.SPADES);
      const trick: PlayedCard[] = [
        { playerId: '1', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE }) },
        { playerId: '2', card: Card.create({ suit: SuitType.SPADES, rank: RankType.SEVEN }) },
      ];

      const winner = TrickService.getTrickWinner(trick, trumpSuit);
      expect(winner?.playerId).toBe('2');
    });

    it('should compare trump cards using trump order', () => {
      const trumpSuit = Suit.create(SuitType.SPADES);
      const trick: PlayedCard[] = [
        { playerId: '1', card: Card.create({ suit: SuitType.SPADES, rank: RankType.ACE }) },
        { playerId: '2', card: Card.create({ suit: SuitType.SPADES, rank: RankType.JACK }) },
      ];

      const winner = TrickService.getTrickWinner(trick, trumpSuit);
      expect(winner?.playerId).toBe('2'); // Jack is highest in trump
    });

    it('should ignore off-suit cards', () => {
      const trick: PlayedCard[] = [
        { playerId: '1', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.SEVEN }) },
        { playerId: '2', card: Card.create({ suit: SuitType.CLUBS, rank: RankType.ACE }) },
        { playerId: '3', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.KING }) },
      ];

      const winner = TrickService.getTrickWinner(trick, null);
      expect(winner?.playerId).toBe('3'); // Only hearts cards count (lead suit)
    });
  });

  describe('calculateTrickPoints', () => {
    it('should sum all card values in trick', () => {
      const trick: PlayedCard[] = [
        { playerId: '1', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE }) },
        { playerId: '2', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.TEN }) },
        { playerId: '3', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.KING }) },
        { playerId: '4', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.QUEEN }) },
      ];

      const points = TrickService.calculateTrickPoints(trick, null);
      expect(points).toBe(11 + 10 + 4 + 3); // Ace=11, Ten=10, King=4, Queen=3 (non-trump)
    });

    it('should use trump values for trump cards', () => {
      const trumpSuit = Suit.create(SuitType.HEARTS);
      const trick: PlayedCard[] = [
        { playerId: '1', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.JACK }) },
        { playerId: '2', card: Card.create({ suit: SuitType.HEARTS, rank: RankType.NINE }) },
      ];

      const points = TrickService.calculateTrickPoints(trick, trumpSuit);
      expect(points).toBe(20 + 14); // Jack=20, Nine=14 (trump values)
    });
  });
});
