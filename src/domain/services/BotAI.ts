import { Card } from '@domain/entities/Card';
import { BidType, ContractType, Bid } from '@domain/types/GameTypes';
import { BiddingService } from './BiddingService';
import { TrickService, PlayedCard } from './TrickService';
import { Suit } from '@domain/value-objects/Suit';

export class BotAI {
  public static decideBid(hand: Card[], currentBids: Bid[]): { type: BidType; contract?: ContractType } {
    // Use existing bidding service logic
    const suggestion = BiddingService.suggestBid(hand, currentBids);

    if (typeof suggestion === 'string' && Object.values(ContractType).includes(suggestion as ContractType)) {
      return {
        type: BidType.CONTRACT,
        contract: suggestion as ContractType,
      };
    }

    return { type: BidType.PASS };
  }

  public static selectCard(
    hand: Card[],
    currentTrick: PlayedCard[],
    trumpSuit: Suit | null,
    partnerIndex: number,
    currentPlayerIndex: number
  ): Card {
    // Find all valid cards
    const validCards = hand.filter((card) =>
      TrickService.isValidPlay(card, hand, currentTrick, trumpSuit, partnerIndex, currentPlayerIndex)
    );

    if (validCards.length === 0) {
      return hand[0]; // Fallback
    }

    // Simple strategy: play lowest valid card
    const sorted = validCards.sort((a, b) => {
      const aValue = a.getValue(a.isTrump(trumpSuit));
      const bValue = b.getValue(b.isTrump(trumpSuit));
      return aValue - bValue;
    });

    return sorted[0];
  }
}
