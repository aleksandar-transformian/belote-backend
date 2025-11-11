import { ScoringService } from '@domain/services/ScoringService';
import { ContractType } from '@domain/types/GameTypes';

describe('ScoringService', () => {
  it('should calculate round score with contract fulfilled', () => {
    const result = ScoringService.calculateRoundScore(
      90, 72, [], [], 1, ContractType.HEARTS, false, false
    );

    expect(result.contractFulfilled).toBe(true);
    expect(result.team1Points).toBe(90);
    expect(result.team2Points).toBe(72);
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
});
