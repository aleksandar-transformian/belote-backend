import { BiddingService } from '@domain/services/BiddingService';
import { BidType, ContractType, Bid } from '@domain/types/GameTypes';

describe('BiddingService', () => {
  describe('isValidBid', () => {
    it('should allow pass at any time', () => {
      const bids: Bid[] = [];
      const newBid = {
        playerId: '1',
        type: BidType.PASS,
        timestamp: new Date(),
      };

      const isValid = BiddingService.isValidBid(bids, newBid, 1);
      expect(isValid).toBe(true);
    });

    it('should allow first contract bid', () => {
      const bids: Bid[] = [];
      const newBid = {
        playerId: '1',
        type: BidType.CONTRACT,
        contract: ContractType.HEARTS,
        timestamp: new Date(),
      };

      const isValid = BiddingService.isValidBid(bids, newBid, 1);
      expect(isValid).toBe(true);
    });

    it('should allow higher contract after existing contract', () => {
      const bids = [{
        playerId: '1',
        type: BidType.CONTRACT,
        contract: ContractType.CLUBS,
        timestamp: new Date(),
      }];

      const newBid = {
        playerId: '2',
        type: BidType.CONTRACT,
        contract: ContractType.HEARTS,
        timestamp: new Date(),
      };

      const isValid = BiddingService.isValidBid(bids, newBid, 2);
      expect(isValid).toBe(true);
    });

    it('should not allow lower contract', () => {
      const bids = [{
        playerId: '1',
        type: BidType.CONTRACT,
        contract: ContractType.HEARTS,
        timestamp: new Date(),
      }];

      const newBid = {
        playerId: '2',
        type: BidType.CONTRACT,
        contract: ContractType.CLUBS,
        timestamp: new Date(),
      };

      const isValid = BiddingService.isValidBid(bids, newBid, 2);
      expect(isValid).toBe(false);
    });

    it('should allow double after contract', () => {
      const bids = [{
        playerId: '1',
        type: BidType.CONTRACT,
        contract: ContractType.HEARTS,
        timestamp: new Date(),
      }];

      const newBid = {
        playerId: '2',
        type: BidType.DOUBLE,
        timestamp: new Date(),
      };

      const isValid = BiddingService.isValidBid(bids, newBid, 2);
      expect(isValid).toBe(true);
    });

    it('should allow redouble after double', () => {
      const bids = [
        {
          playerId: '1',
          type: BidType.CONTRACT,
          contract: ContractType.HEARTS,
          timestamp: new Date(),
        },
        {
          playerId: '2',
          type: BidType.DOUBLE,
          timestamp: new Date(),
        },
      ];

      const newBid = {
        playerId: '1',
        type: BidType.REDOUBLE,
        timestamp: new Date(),
      };

      const isValid = BiddingService.isValidBid(bids, newBid, 1);
      expect(isValid).toBe(true);
    });
  });

  describe('isBiddingComplete', () => {
    it('should return false if less than 4 bids', () => {
      const bids = [
        { playerId: '1', type: BidType.PASS, timestamp: new Date() },
        { playerId: '2', type: BidType.PASS, timestamp: new Date() },
      ];

      expect(BiddingService.isBiddingComplete(bids)).toBe(false);
    });

    it('should return true after four passes', () => {
      const bids = [
        { playerId: '1', type: BidType.PASS, timestamp: new Date() },
        { playerId: '2', type: BidType.PASS, timestamp: new Date() },
        { playerId: '3', type: BidType.PASS, timestamp: new Date() },
        { playerId: '4', type: BidType.PASS, timestamp: new Date() },
      ];

      expect(BiddingService.isBiddingComplete(bids)).toBe(true);
    });

    it('should return true after contract and three passes', () => {
      const bids = [
        { playerId: '1', type: BidType.CONTRACT, contract: ContractType.HEARTS, timestamp: new Date() },
        { playerId: '2', type: BidType.PASS, timestamp: new Date() },
        { playerId: '3', type: BidType.PASS, timestamp: new Date() },
        { playerId: '4', type: BidType.PASS, timestamp: new Date() },
      ];

      expect(BiddingService.isBiddingComplete(bids)).toBe(true);
    });

    it('should return false if only two passes after contract', () => {
      const bids = [
        { playerId: '1', type: BidType.CONTRACT, contract: ContractType.HEARTS, timestamp: new Date() },
        { playerId: '2', type: BidType.PASS, timestamp: new Date() },
        { playerId: '3', type: BidType.PASS, timestamp: new Date() },
      ];

      expect(BiddingService.isBiddingComplete(bids)).toBe(false);
    });
  });

  describe('getFinalContract', () => {
    it('should return null if no contract bid', () => {
      const bids = [
        { playerId: '1', type: BidType.PASS, timestamp: new Date() },
        { playerId: '2', type: BidType.PASS, timestamp: new Date() },
      ];

      const result = BiddingService.getFinalContract(bids);
      expect(result.contract).toBeNull();
      expect(result.contractPlayerId).toBeNull();
    });

    it('should return last contract bid', () => {
      const bids = [
        { playerId: '1', type: BidType.CONTRACT, contract: ContractType.CLUBS, timestamp: new Date() },
        { playerId: '2', type: BidType.CONTRACT, contract: ContractType.HEARTS, timestamp: new Date() },
        { playerId: '3', type: BidType.PASS, timestamp: new Date() },
      ];

      const result = BiddingService.getFinalContract(bids);
      expect(result.contract).toBe(ContractType.HEARTS);
      expect(result.contractPlayerId).toBe('2');
    });

    it('should detect doubled contract', () => {
      const bids = [
        { playerId: '1', type: BidType.CONTRACT, contract: ContractType.HEARTS, timestamp: new Date() },
        { playerId: '2', type: BidType.DOUBLE, timestamp: new Date() },
      ];

      const result = BiddingService.getFinalContract(bids);
      expect(result.isDoubled).toBe(true);
      expect(result.isRedoubled).toBe(false);
    });

    it('should detect redoubled contract', () => {
      const bids = [
        { playerId: '1', type: BidType.CONTRACT, contract: ContractType.HEARTS, timestamp: new Date() },
        { playerId: '2', type: BidType.DOUBLE, timestamp: new Date() },
        { playerId: '1', type: BidType.REDOUBLE, timestamp: new Date() },
      ];

      const result = BiddingService.getFinalContract(bids);
      expect(result.isDoubled).toBe(false);
      expect(result.isRedoubled).toBe(true);
    });
  });
});
