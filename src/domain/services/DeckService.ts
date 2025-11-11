import { Card } from '@domain/entities/Card';
import { SuitType } from '@domain/value-objects/Suit';
import { RankType } from '@domain/value-objects/Rank';

export class DeckService {
  public static createDeck(): Card[] {
    const suits = Object.values(SuitType);
    const ranks = Object.values(RankType);
    const deck: Card[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push(Card.create({ suit, rank }));
      }
    }

    return deck;
  }

  public static shuffle(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public static deal(deck: Card[], numPlayers: number = 4): Card[][] {
    const hands: Card[][] = Array.from({ length: numPlayers }, () => []);

    // First deal: 3 cards to each player
    for (let i = 0; i < 3; i++) {
      for (let player = 0; player < numPlayers; player++) {
        const card = deck.shift();
        if (card) hands[player].push(card);
      }
    }

    // Second deal: 2 cards to each player
    for (let i = 0; i < 2; i++) {
      for (let player = 0; player < numPlayers; player++) {
        const card = deck.shift();
        if (card) hands[player].push(card);
      }
    }

    return hands;
  }

  public static dealRemainingCards(deck: Card[], hands: Card[][], numPlayers: number = 4): void {
    // Deal remaining 3 cards to each player
    for (let i = 0; i < 3; i++) {
      for (let player = 0; player < numPlayers; player++) {
        const card = deck.shift();
        if (card) hands[player].push(card);
      }
    }
  }
}
