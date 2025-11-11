import { DeckService } from '@domain/services/DeckService';
import { SuitType } from '@domain/value-objects/Suit';
import { RankType } from '@domain/value-objects/Rank';

describe('DeckService', () => {
  describe('createDeck', () => {
    it('should create a deck with 32 cards', () => {
      const deck = DeckService.createDeck();
      expect(deck.length).toBe(32);
    });

    it('should have 8 cards per suit', () => {
      const deck = DeckService.createDeck();
      const suits = Object.values(SuitType);

      for (const suit of suits) {
        const cardsInSuit = deck.filter(card => card.getSuit().getValue() === suit);
        expect(cardsInSuit.length).toBe(8);
      }
    });

    it('should have 4 cards per rank', () => {
      const deck = DeckService.createDeck();
      const ranks = Object.values(RankType);

      for (const rank of ranks) {
        const cardsWithRank = deck.filter(card => card.getRank().getValue() === rank);
        expect(cardsWithRank.length).toBe(4);
      }
    });
  });

  describe('shuffle', () => {
    it('should return a deck with same number of cards', () => {
      const deck = DeckService.createDeck();
      const shuffled = DeckService.shuffle(deck);
      expect(shuffled.length).toBe(deck.length);
    });

    it('should not modify original deck', () => {
      const deck = DeckService.createDeck();
      const firstCardBefore = deck[0];
      DeckService.shuffle(deck);
      expect(deck[0]).toBe(firstCardBefore);
    });

    it('should produce different order (statistically)', () => {
      const deck = DeckService.createDeck();
      const shuffled = DeckService.shuffle(deck);

      // At least one card should be in a different position
      let hasDifference = false;
      for (let i = 0; i < deck.length; i++) {
        if (!deck[i].equals(shuffled[i])) {
          hasDifference = true;
          break;
        }
      }
      expect(hasDifference).toBe(true);
    });
  });

  describe('deal', () => {
    it('should deal 5 cards to each player initially', () => {
      const deck = DeckService.createDeck();
      const shuffled = DeckService.shuffle(deck);
      const hands = DeckService.deal(shuffled, 4);

      expect(hands.length).toBe(4);
      hands.forEach(hand => {
        expect(hand.length).toBe(5);
      });
    });

    it('should remove dealt cards from deck', () => {
      const deck = DeckService.createDeck();
      const shuffled = DeckService.shuffle(deck);
      const deckCopy = [...shuffled];
      DeckService.deal(shuffled, 4);

      expect(shuffled.length).toBe(12); // 32 - 20 = 12 cards left
    });
  });

  describe('dealRemainingCards', () => {
    it('should deal remaining 3 cards to each player', () => {
      const deck = DeckService.createDeck();
      const shuffled = DeckService.shuffle(deck);
      const hands = DeckService.deal(shuffled, 4);

      DeckService.dealRemainingCards(shuffled, hands, 4);

      hands.forEach(hand => {
        expect(hand.length).toBe(8); // 5 + 3
      });
    });

    it('should empty the deck', () => {
      const deck = DeckService.createDeck();
      const shuffled = DeckService.shuffle(deck);
      const hands = DeckService.deal(shuffled, 4);

      DeckService.dealRemainingCards(shuffled, hands, 4);

      expect(shuffled.length).toBe(0);
    });
  });
});
