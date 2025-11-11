import { Card } from '@domain/entities/Card';
import { Suit } from '@domain/value-objects/Suit';
import { ContractType } from '@domain/types/GameTypes';

export interface PlayedCard {
  playerId: string;
  card: Card;
}

export class TrickService {
  public static isValidPlay(
    card: Card,
    hand: Card[],
    currentTrick: PlayedCard[],
    trumpSuit: Suit | null,
    partnerIndex: number,
    currentPlayerIndex: number
  ): boolean {
    if (!hand.some(c => c.equals(card))) {
      return false; // Card not in hand
    }

    if (currentTrick.length === 0) {
      return true; // First card, any card is valid
    }

    const leadCard = currentTrick[0].card;
    const leadSuit = leadCard.getSuit();

    // Rule 1: Must follow suit if possible
    const hasSuit = hand.some(c => c.getSuit().equals(leadSuit));
    if (hasSuit && !card.getSuit().equals(leadSuit)) {
      // Exception: playing trump when can't follow suit
      if (card.isTrump(trumpSuit)) {
        return !hand.some(c => c.getSuit().equals(leadSuit));
      }
      return false;
    }

    // Rule 2: If can't follow suit, must play trump if have one
    if (!hasSuit && !card.isTrump(trumpSuit)) {
      const hasTrump = hand.some(c => c.isTrump(trumpSuit));
      if (hasTrump) {
        return false;
      }
    }

    // Rule 3: Must play higher trump if possible (unless partner is winning)
    if (card.isTrump(trumpSuit)) {
      const currentWinner = this.getTrickWinner(currentTrick, trumpSuit);
      const isPartnerWinning = currentWinner?.playerId === this.getPartnerId(currentPlayerIndex, partnerIndex);

      if (!isPartnerWinning) {
        const highestTrumpInTrick = this.getHighestTrump(currentTrick, trumpSuit);
        if (highestTrumpInTrick) {
          const canPlayHigher = hand.some(c =>
            c.isTrump(trumpSuit) &&
            c.getRank().getTrumpOrder() > highestTrumpInTrick.card.getRank().getTrumpOrder()
          );

          if (canPlayHigher && card.getRank().getTrumpOrder() <= highestTrumpInTrick.card.getRank().getTrumpOrder()) {
            return false;
          }
        }
      }
    }

    return true;
  }

  public static getTrickWinner(trick: PlayedCard[], trumpSuit: Suit | null): PlayedCard | null {
    if (trick.length === 0) return null;

    const leadSuit = trick[0].card.getSuit();
    let winner = trick[0];

    for (let i = 1; i < trick.length; i++) {
      const current = trick[i];
      const currentCard = current.card;
      const winnerCard = winner.card;

      // Trump beats non-trump
      if (currentCard.isTrump(trumpSuit) && !winnerCard.isTrump(trumpSuit)) {
        winner = current;
        continue;
      }

      // Both trumps - higher wins
      if (currentCard.isTrump(trumpSuit) && winnerCard.isTrump(trumpSuit)) {
        if (currentCard.getRank().getTrumpOrder() > winnerCard.getRank().getTrumpOrder()) {
          winner = current;
        }
        continue;
      }

      // Both same suit (not trump) - higher wins
      if (currentCard.getSuit().equals(leadSuit) && winnerCard.getSuit().equals(leadSuit)) {
        if (currentCard.getRank().getNonTrumpOrder() > winnerCard.getRank().getNonTrumpOrder()) {
          winner = current;
        }
      }
    }

    return winner;
  }

  public static calculateTrickPoints(trick: PlayedCard[], trumpSuit: Suit | null): number {
    let points = 0;
    for (const played of trick) {
      points += played.card.getValue(played.card.isTrump(trumpSuit));
    }
    return points;
  }

  private static getHighestTrump(trick: PlayedCard[], trumpSuit: Suit | null): PlayedCard | null {
    const trumps = trick.filter(p => p.card.isTrump(trumpSuit));
    if (trumps.length === 0) return null;

    return trumps.reduce((highest, current) => {
      return current.card.getRank().getTrumpOrder() > highest.card.getRank().getTrumpOrder()
        ? current
        : highest;
    });
  }

  private static getPartnerId(currentPlayerIndex: number, partnerIndex: number): string {
    // In Belote, partners are opposite: 0-2, 1-3
    // This would need actual player IDs from game state
    return 'partner'; // Placeholder
  }
}
