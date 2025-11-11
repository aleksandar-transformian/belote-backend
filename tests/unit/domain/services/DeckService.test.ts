import { DeckService } from '@domain/services/DeckService';
import { SuitType } from '@domain/value-objects/Suit';
import { RankType } from '@domain/value-objects/Rank';

describe('DeckService', () => {
  describe('createDeck', () => {
    it('should create a deck with 32 cards', () => {
      const deck = DeckService.createDeck();
      expect(deck).toHaveLength(32);
    });

    it('should create deck with all suits and ranks', () => {
      const deck = DeckService.createDeck();
      const suits = Object.values(SuitType);
      const ranks = Object.values(RankType);

      for (const suit of suits) {
        for (const rank of ranks) {
          const card = deck.find(c => c.getSuit().getValue() === suit && c.getRank().getValue() === rank);
          expect(card).toBeDefined();
        }
      }
    });
  });

  describe('shuffle', () => {
    it('should return a shuffled deck with same length', () => {
      const deck = DeckService.createDeck();
      const shuffled = DeckService.shuffle(deck);
      expect(shuffled).toHaveLength(32);
    });

    it('should not modify original deck', () => {
      const deck = DeckService.createDeck();
      const originalFirst = deck[0];
      DeckService.shuffle(deck);
      expect(deck[0]).toBe(originalFirst);
    });
  });

  describe('deal', () => {
    it('should deal 5 cards to each of 4 players', () => {
      const deck = DeckService.createDeck();
      const hands = DeckService.deal(deck);

      expect(hands).toHaveLength(4);
      hands.forEach(hand => {
        expect(hand).toHaveLength(5);
      });
    });

    it('should leave 12 cards in deck after dealing', () => {
      const deck = DeckService.createDeck();
      DeckService.deal(deck);
      expect(deck).toHaveLength(12);
    });
  });

  describe('dealRemainingCards', () => {
    it('should deal 3 more cards to each player', () => {
      const deck = DeckService.createDeck();
      const hands = DeckService.deal(deck);
      DeckService.dealRemainingCards(deck, hands);

      hands.forEach(hand => {
        expect(hand).toHaveLength(8);
      });
    });

    it('should empty the deck after dealing remaining cards', () => {
      const deck = DeckService.createDeck();
      const hands = DeckService.deal(deck);
      DeckService.dealRemainingCards(deck, hands);
      expect(deck).toHaveLength(0);
    });
  });
});
