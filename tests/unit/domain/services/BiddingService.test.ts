import { BiddingService } from '@domain/services/BiddingService';
import { BidType, ContractType, Bid } from '@domain/types/GameTypes';

describe('BiddingService', () => {
  describe('isValidBid', () => {
    it('should allow pass as first bid', () => {
      const bid: Bid = {
        playerId: 'player1',
        type: BidType.PASS,
        timestamp: new Date(),
      };
      expect(BiddingService.isValidBid([], bid, 1)).toBe(true);
    });

    it('should allow contract as first bid', () => {
      const bid: Bid = {
        playerId: 'player1',
        type: BidType.CONTRACT,
        contract: ContractType.HEARTS,
        timestamp: new Date(),
      };
      expect(BiddingService.isValidBid([], bid, 1)).toBe(true);
    });

    it('should allow higher contract after existing contract', () => {
      const existingBids: Bid[] = [{
        playerId: 'player1',
        type: BidType.CONTRACT,
        contract: ContractType.CLUBS,
        timestamp: new Date(),
      }];

      const newBid: Bid = {
        playerId: 'player2',
        type: BidType.CONTRACT,
        contract: ContractType.SPADES,
        timestamp: new Date(),
      };

      expect(BiddingService.isValidBid(existingBids, newBid, 2)).toBe(true);
    });

    it('should not allow lower contract', () => {
      const existingBids: Bid[] = [{
        playerId: 'player1',
        type: BidType.CONTRACT,
        contract: ContractType.SPADES,
        timestamp: new Date(),
      }];

      const newBid: Bid = {
        playerId: 'player2',
        type: BidType.CONTRACT,
        contract: ContractType.CLUBS,
        timestamp: new Date(),
      };

      expect(BiddingService.isValidBid(existingBids, newBid, 2)).toBe(false);
    });
  });

  describe('isBiddingComplete', () => {
    it('should return false with less than 4 bids', () => {
      const bids: Bid[] = [
        { playerId: 'p1', type: BidType.PASS, timestamp: new Date() },
        { playerId: 'p2', type: BidType.PASS, timestamp: new Date() },
      ];
      expect(BiddingService.isBiddingComplete(bids)).toBe(false);
    });

    it('should return true with four passes', () => {
      const bids: Bid[] = [
        { playerId: 'p1', type: BidType.PASS, timestamp: new Date() },
        { playerId: 'p2', type: BidType.PASS, timestamp: new Date() },
        { playerId: 'p3', type: BidType.PASS, timestamp: new Date() },
        { playerId: 'p4', type: BidType.PASS, timestamp: new Date() },
      ];
      expect(BiddingService.isBiddingComplete(bids)).toBe(true);
    });

    it('should return true with contract followed by three passes', () => {
      const bids: Bid[] = [
        { playerId: 'p1', type: BidType.CONTRACT, contract: ContractType.HEARTS, timestamp: new Date() },
        { playerId: 'p2', type: BidType.PASS, timestamp: new Date() },
        { playerId: 'p3', type: BidType.PASS, timestamp: new Date() },
        { playerId: 'p4', type: BidType.PASS, timestamp: new Date() },
      ];
      expect(BiddingService.isBiddingComplete(bids)).toBe(true);
    });
  });

  describe('getFinalContract', () => {
    it('should return null with no contract bids', () => {
      const bids: Bid[] = [
        { playerId: 'p1', type: BidType.PASS, timestamp: new Date() },
        { playerId: 'p2', type: BidType.PASS, timestamp: new Date() },
      ];
      const result = BiddingService.getFinalContract(bids);
      expect(result.contract).toBeNull();
    });

    it('should return the last contract bid', () => {
      const bids: Bid[] = [
        { playerId: 'p1', type: BidType.CONTRACT, contract: ContractType.CLUBS, timestamp: new Date() },
        { playerId: 'p2', type: BidType.CONTRACT, contract: ContractType.HEARTS, timestamp: new Date() },
        { playerId: 'p3', type: BidType.PASS, timestamp: new Date() },
      ];
      const result = BiddingService.getFinalContract(bids);
      expect(result.contract).toBe(ContractType.HEARTS);
    });

    it('should detect doubled contract', () => {
      const bids: Bid[] = [
        { playerId: 'p1', type: BidType.CONTRACT, contract: ContractType.HEARTS, timestamp: new Date() },
        { playerId: 'p2', type: BidType.DOUBLE, timestamp: new Date() },
      ];
      const result = BiddingService.getFinalContract(bids);
      expect(result.isDoubled).toBe(true);
      expect(result.isRedoubled).toBe(false);
    });

    it('should detect redoubled contract', () => {
      const bids: Bid[] = [
        { playerId: 'p1', type: BidType.CONTRACT, contract: ContractType.HEARTS, timestamp: new Date() },
        { playerId: 'p2', type: BidType.DOUBLE, timestamp: new Date() },
        { playerId: 'p1', type: BidType.REDOUBLE, timestamp: new Date() },
      ];
      const result = BiddingService.getFinalContract(bids);
      expect(result.isDoubled).toBe(false);
      expect(result.isRedoubled).toBe(true);
    });
  });
});
