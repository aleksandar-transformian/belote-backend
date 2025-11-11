import { Bid, BidType, ContractType } from '@domain/types/GameTypes';
import { Card } from '@domain/entities/Card';

export class BiddingService {
  public static isValidBid(currentBids: Bid[], newBid: Bid, playerTeam: 1 | 2): boolean {
    if (newBid.type === BidType.PASS) {
      return true;
    }

    const lastContractBid = this.getLastContractBid(currentBids);

    if (newBid.type === BidType.CONTRACT) {
      // First contract or higher contract
      if (!lastContractBid) {
        return true;
      }
      return this.isHigherContract(newBid.contract!, lastContractBid.contract!);
    }

    if (newBid.type === BidType.DOUBLE) {
      // Can only double opponent's contract
      if (!lastContractBid || lastContractBid.type !== BidType.CONTRACT) {
        return false;
      }
      const lastContractPlayer = currentBids.find(b => b === lastContractBid);
      // Check if last contract was made by opponent
      return true; // Simplified - should check team
    }

    if (newBid.type === BidType.REDOUBLE) {
      // Can only redouble if opponent doubled
      const lastBid = currentBids[currentBids.length - 1];
      return lastBid?.type === BidType.DOUBLE;
    }

    return false;
  }

  public static isBiddingComplete(bids: Bid[]): boolean {
    if (bids.length < 4) return false;

    // Check for four passes (no contract)
    if (bids.slice(-4).every(b => b.type === BidType.PASS)) {
      return true;
    }

    // Check for three passes after a contract/double/redouble
    const lastNonPassBid = bids.slice().reverse().find(b => b.type !== BidType.PASS);
    if (!lastNonPassBid) return false;

    const lastNonPassIndex = bids.lastIndexOf(lastNonPassBid);
    const passesAfter = bids.slice(lastNonPassIndex + 1);

    return passesAfter.length >= 3 && passesAfter.every(b => b.type === BidType.PASS);
  }

  public static getFinalContract(bids: Bid[]): {
    contract: ContractType | null;
    isDoubled: boolean;
    isRedoubled: boolean;
    contractPlayerId: string | null;
  } {
    const contractBid = this.getLastContractBid(bids);
    if (!contractBid) {
      return { contract: null, isDoubled: false, isRedoubled: false, contractPlayerId: null };
    }

    const hasDouble = bids.some(b => b.type === BidType.DOUBLE);
    const hasRedouble = bids.some(b => b.type === BidType.REDOUBLE);

    return {
      contract: contractBid.contract!,
      isDoubled: hasDouble && !hasRedouble,
      isRedoubled: hasRedouble,
      contractPlayerId: contractBid.playerId,
    };
  }

  private static getLastContractBid(bids: Bid[]): Bid | null {
    return bids.slice().reverse().find(b => b.type === BidType.CONTRACT) || null;
  }

  private static isHigherContract(newContract: ContractType, currentContract: ContractType): boolean {
    const contractOrder = [
      ContractType.CLUBS,
      ContractType.DIAMONDS,
      ContractType.HEARTS,
      ContractType.SPADES,
      ContractType.NO_TRUMPS,
      ContractType.ALL_TRUMPS,
    ];

    return contractOrder.indexOf(newContract) > contractOrder.indexOf(currentContract);
  }

  // AI suggestion for bidding (simple heuristic)
  public static suggestBid(hand: Card[], currentBids: Bid[]): BidType | ContractType {
    // Count trumps and high cards for each suit
    const suitStrength = this.calculateSuitStrength(hand);

    // Find strongest suit
    const strongestSuit = Object.entries(suitStrength)
      .sort((a, b) => b[1] - a[1])[0];

    const finalContract = this.getFinalContract(currentBids);

    // Simple logic: bid if strong enough, pass otherwise
    if (strongestSuit[1] >= 30) {
      const suggestedContract = this.suitToContract(strongestSuit[0]);
      if (!finalContract.contract || this.isHigherContract(suggestedContract, finalContract.contract)) {
        return suggestedContract;
      }
    }

    return BidType.PASS;
  }

  private static calculateSuitStrength(hand: Card[]): Record<string, number> {
    const strength: Record<string, number> = {
      CLUBS: 0,
      DIAMONDS: 0,
      HEARTS: 0,
      SPADES: 0,
    };

    for (const card of hand) {
      const suit = card.getSuit().getValue();
      strength[suit] += card.getValue(true); // Calculate as trump value
    }

    return strength;
  }

  private static suitToContract(suit: string): ContractType {
    return suit as ContractType;
  }
}
