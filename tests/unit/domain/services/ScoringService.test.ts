import { ScoringService } from '@domain/services/ScoringService';
import { ContractType } from '@domain/types/GameTypes';

describe('ScoringService', () => {
  describe('calculateRoundScore', () => {
    it('should calculate round score with contract fulfilled', () => {
      const result = ScoringService.calculateRoundScore(
        90, 72, [], [], 1, ContractType.HEARTS, false, false
      );

      expect(result.contractFulfilled).toBe(true);
      expect(result.team1Points).toBe(90);
      expect(result.team2Points).toBe(72);
      expect(result.isValat).toBe(false);
    });

    it('should give all points to opponent if contract not fulfilled', () => {
      const result = ScoringService.calculateRoundScore(
        70, 92, [], [], 1, ContractType.HEARTS, false, false
      );

      expect(result.contractFulfilled).toBe(false);
      expect(result.team1Points).toBe(0);
      expect(result.team2Points).toBe(162);
    });

    it('should double points for no trumps contract', () => {
      const result = ScoringService.calculateRoundScore(
        90, 70, [], [], 1, ContractType.NO_TRUMPS, false, false
      );

      expect(result.team1Points).toBe(180);
      expect(result.team2Points).toBe(140);
    });

    it('should double points when doubled', () => {
      const result = ScoringService.calculateRoundScore(
        90, 72, [], [], 1, ContractType.HEARTS, true, false
      );

      expect(result.team1Points).toBe(180);
      expect(result.team2Points).toBe(144);
    });

    it('should quadruple points when redoubled', () => {
      const result = ScoringService.calculateRoundScore(
        90, 72, [], [], 1, ContractType.HEARTS, false, true
      );

      expect(result.team1Points).toBe(360);
      expect(result.team2Points).toBe(288);
    });

    it('should detect valat (all tricks won)', () => {
      const result = ScoringService.calculateRoundScore(
        162, 0, [], [], 1, ContractType.HEARTS, false, false
      );

      expect(result.isValat).toBe(true);
      expect(result.contractFulfilled).toBe(true);
    });

    it('should include declaration points in total', () => {
      const team1Declarations = [
        { type: 'TIERCE' as any, cards: [], points: 20, playerId: '1' },
      ];
      const team2Declarations = [
        { type: 'TIERCE' as any, cards: [], points: 20, playerId: '2' },
      ];

      const result = ScoringService.calculateRoundScore(
        90, 52, team1Declarations, team2Declarations, 1, ContractType.HEARTS, false, false
      );

      expect(result.team1Points).toBe(110); // 90 + 20
      expect(result.team2Points).toBe(72); // 52 + 20
      expect(result.team1Declarations).toBe(20);
      expect(result.team2Declarations).toBe(20);
      expect(result.contractFulfilled).toBe(true); // 110 > 91 (half of 182)
    });
  });

  describe('convertToMatchPoints', () => {
    it('should convert round score to match points', () => {
      const roundScore = {
        team1Points: 90,
        team2Points: 72,
        team1Declarations: 0,
        team2Declarations: 0,
        contractFulfilled: true,
        isValat: false,
      };

      const matchPoints = ScoringService.convertToMatchPoints(roundScore, ContractType.HEARTS);

      expect(matchPoints.team1).toBe(9); // 90/10 = 9
      expect(matchPoints.team2).toBe(7); // 72/10 = 7 (rounded down from 7.2)
    });

    it('should add valat bonus', () => {
      const roundScore = {
        team1Points: 162,
        team2Points: 0,
        team1Declarations: 0,
        team2Declarations: 0,
        contractFulfilled: true,
        isValat: true,
      };

      const matchPoints = ScoringService.convertToMatchPoints(roundScore, ContractType.HEARTS);

      expect(matchPoints.team1).toBe(25); // 162/10 + 9 (valat bonus)
      expect(matchPoints.team2).toBe(0);
    });

    it('should double valat bonus for no trumps', () => {
      const roundScore = {
        team1Points: 260,
        team2Points: 0,
        team1Declarations: 0,
        team2Declarations: 0,
        contractFulfilled: true,
        isValat: true,
      };

      const matchPoints = ScoringService.convertToMatchPoints(roundScore, ContractType.NO_TRUMPS);

      expect(matchPoints.team1).toBe(44); // 260/10 + 18 (valat bonus * 2)
      expect(matchPoints.team2).toBe(0);
    });
  });
});
